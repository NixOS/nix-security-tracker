var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/serialization/deserializer.ts
import {
  ArrayType,
  ConditionalType,
  DeclarationReflection,
  DocumentReflection,
  IndexedAccessType,
  InferredType,
  IntersectionType,
  IntrinsicType,
  LiteralType,
  MappedType,
  NamedTupleMember,
  OptionalType,
  ParameterReflection,
  PredicateType,
  ProjectReflection,
  QueryType,
  ReferenceReflection,
  ReferenceType,
  Reflection,
  ReflectionKind,
  ReflectionType,
  RestType,
  SignatureReflection,
  TemplateLiteralType,
  TupleType,
  TypeOperatorType,
  TypeParameterReflection,
  UnionType,
  UnknownType
} from "#models";
import { assert, insertPrioritySorted } from "#utils";

// src/lib/serialization/schema.ts
var schema_exports = {};
__export(schema_exports, {
  SCHEMA_VERSION: () => SCHEMA_VERSION
});
var SCHEMA_VERSION = "2.0";

// src/lib/serialization/deserializer.ts
var supportedSchemaVersions = [SCHEMA_VERSION];
var Deserializer = class {
  constructor(logger) {
    this.logger = logger;
  }
  logger;
  deferred = [];
  deserializers = [];
  activeReflection = [];
  reflectionBuilders = {
    declaration(parent, obj) {
      return new DeclarationReflection(obj.name, obj.kind, parent);
    },
    document(parent, obj) {
      return new DocumentReflection(obj.name, parent, [], {});
    },
    param(parent, obj) {
      return new ParameterReflection(obj.name, obj.kind, parent);
    },
    project() {
      throw new Error(
        "Not supported, use Deserializer.reviveProject(s) instead."
      );
    },
    reference(parent, obj) {
      return new ReferenceReflection(
        obj.name,
        /* target */
        parent,
        parent
      );
    },
    signature(parent, obj) {
      return new SignatureReflection(
        obj.name,
        obj.kind,
        parent
      );
    },
    typeParam(parent, obj) {
      return new TypeParameterReflection(obj.name, parent, void 0);
    }
  };
  typeBuilders = {
    array(obj, de) {
      return new ArrayType(de.reviveType(obj.elementType));
    },
    conditional(obj, de) {
      return new ConditionalType(
        de.reviveType(obj.checkType),
        de.reviveType(obj.extendsType),
        de.reviveType(obj.trueType),
        de.reviveType(obj.falseType)
      );
    },
    indexedAccess(obj, de) {
      return new IndexedAccessType(
        de.reviveType(obj.objectType),
        de.reviveType(obj.indexType)
      );
    },
    inferred(obj, de) {
      return new InferredType(obj.name, de.reviveType(obj.constraint));
    },
    intersection(obj, de) {
      return new IntersectionType(obj.types.map((t) => de.reviveType(t)));
    },
    intrinsic(obj) {
      return new IntrinsicType(obj.name);
    },
    literal(obj) {
      if (typeof obj.value === "object" && obj.value != null) {
        return new LiteralType(
          BigInt(
            `${obj.value.negative ? "-" : ""}${obj.value.value}`
          )
        );
      }
      return new LiteralType(obj.value);
    },
    mapped(obj, de) {
      return new MappedType(
        obj.parameter,
        de.reviveType(obj.parameterType),
        de.reviveType(obj.templateType),
        obj.readonlyModifier,
        obj.optionalModifier,
        de.reviveType(obj.nameType)
      );
    },
    optional(obj, de) {
      return new OptionalType(de.reviveType(obj.elementType));
    },
    predicate(obj, de) {
      return new PredicateType(
        obj.name,
        obj.asserts,
        de.reviveType(obj.targetType)
      );
    },
    query(obj, de) {
      return new QueryType(de.reviveType(obj.queryType));
    },
    reference(obj) {
      return ReferenceType.createResolvedReference(obj.name, -2, null);
    },
    reflection(obj, de) {
      return new ReflectionType(
        de.revive(obj.declaration, (o) => de.constructReflection(o))
      );
    },
    rest(obj, de) {
      return new RestType(de.reviveType(obj.elementType));
    },
    templateLiteral(obj, de) {
      return new TemplateLiteralType(
        obj.head,
        obj.tail.map(([t, s]) => [de.reviveType(t), s])
      );
    },
    tuple(obj, de) {
      return new TupleType(
        obj.elements?.map((t) => de.reviveType(t)) || []
      );
    },
    namedTupleMember(obj, de) {
      return new NamedTupleMember(
        obj.name,
        obj.isOptional,
        de.reviveType(obj.element)
      );
    },
    typeOperator(obj, de) {
      return new TypeOperatorType(
        de.reviveType(obj.target),
        obj.operator
      );
    },
    union(obj, de) {
      return new UnionType(obj.types.map((t) => de.reviveType(t)));
    },
    unknown(obj) {
      return new UnknownType(obj.name);
    }
  };
  /**
   * Only set when deserializing.
   */
  projectRoot;
  oldIdToNewId = {};
  oldFileIdToNewFileId = {};
  project;
  addDeserializer(de) {
    insertPrioritySorted(this.deserializers, de);
  }
  /**
   * Revive a single project into the structure it was originally created with.
   * This is generally not appropriate for merging multiple projects since projects may
   * contain reflections in their root, not inside a module.
   */
  reviveProject(name, projectObj, options) {
    assert(
      this.deferred.length === 0,
      "Deserializer.defer was called when not deserializing"
    );
    if (!supportedSchemaVersions.includes(projectObj.schemaVersion)) {
      throw new Error(
        `Attempted to deserialize version "${projectObj.schemaVersion}" JSON, which is not supported. Supported versions: ${supportedSchemaVersions.join(", ")}`
      );
    }
    const project = new ProjectReflection(
      name || projectObj.name,
      options.registry
    );
    this.project = project;
    this.projectRoot = options.projectRoot;
    this.oldIdToNewId = { [projectObj.id]: project.id };
    this.oldFileIdToNewFileId = {};
    this.fromObject(project, projectObj);
    const deferred = this.deferred;
    this.deferred = [];
    for (const def of deferred) {
      def(project);
    }
    assert(
      this.deferred.length === 0,
      "Work may not be double deferred when deserializing."
    );
    assert(
      this.activeReflection.length === 0,
      "Imbalanced reflection deserialization"
    );
    this.project = void 0;
    this.projectRoot = void 0;
    this.oldIdToNewId = {};
    this.oldFileIdToNewFileId = {};
    return project;
  }
  reviveProjects(name, projects, options) {
    if (projects.length === 1 && !options.alwaysCreateEntryPointModule) {
      return this.reviveProject(name, projects[0], options);
    }
    const project = new ProjectReflection(name, options.registry);
    this.project = project;
    this.projectRoot = options.projectRoot;
    for (const proj of projects) {
      assert(
        this.deferred.length === 0,
        "Deserializer.defer was called when not deserializing"
      );
      if (!supportedSchemaVersions.includes(proj.schemaVersion)) {
        throw new Error(
          `Attempted to deserialize version "${proj.schemaVersion}" JSON, which is not supported. Supported versions: ${supportedSchemaVersions.join(", ")}`
        );
      }
      const projModule = new DeclarationReflection(
        proj.name,
        ReflectionKind.Module,
        project
      );
      project.registerReflection(projModule, void 0, void 0);
      project.addChild(projModule);
      this.oldIdToNewId = { [proj.id]: projModule.id };
      this.oldFileIdToNewFileId = {};
      this.fromObject(projModule, proj);
      const deferred = this.deferred;
      this.deferred = [];
      for (const def of deferred) {
        def(project);
      }
      assert(
        this.deferred.length === 0,
        "Work may not be double deferred when deserializing."
      );
      assert(
        this.activeReflection.length === 0,
        "Imbalanced reflection deserialization"
      );
    }
    this.oldIdToNewId = {};
    this.oldFileIdToNewFileId = {};
    this.project = void 0;
    this.projectRoot = void 0;
    return project;
  }
  revive(source, creator) {
    if (source) {
      const revived = creator(source);
      this.fromObject(revived, source);
      return revived;
    }
  }
  reviveMany(sourceArray, creator) {
    if (sourceArray) {
      return sourceArray.map((item) => {
        const revived = creator(item);
        this.fromObject(revived, item);
        return revived;
      });
    }
  }
  reviveType(obj) {
    return this.revive(obj, (o) => this.constructType(o));
  }
  constructReflection(obj) {
    assert(this.activeReflection.length > 0);
    const result = this.reflectionBuilders[obj.variant](
      this.activeReflection[this.activeReflection.length - 1],
      obj
    );
    this.oldIdToNewId[obj.id] = result.id;
    this.project.registerReflection(result, void 0, void 0);
    return result;
  }
  constructType(obj) {
    const result = this.typeBuilders[obj.type](obj, this);
    return result;
  }
  fromObject(receiver, obj) {
    if (receiver instanceof Reflection) {
      this.activeReflection.push(receiver);
    }
    receiver.fromObject(this, obj);
    for (const de of this.deserializers) {
      if (de.supports(receiver, obj)) {
        de.fromObject(receiver, obj);
      }
    }
    if (receiver instanceof Reflection) {
      this.activeReflection.pop();
    }
  }
  /**
   * Defers work until the initial pass of serialization has been completed.
   * This can be used to set up references which cannot be immediately restored.
   *
   * May only be called when deserializing.
   */
  defer(cb) {
    this.deferred.push(cb);
  }
};

// src/lib/serialization/events.ts
var SerializeEvent = class {
  /**
   * The project the renderer is currently processing.
   */
  project;
  output;
  constructor(project, output) {
    this.project = project;
    this.output = output;
  }
};

// src/lib/serialization/serializer.ts
import { EventDispatcher, insertPrioritySorted as insertPrioritySorted2, removeIfPresent } from "#utils";
var Serializer = class _Serializer extends EventDispatcher {
  /**
   * Triggered when the {@link Serializer} begins transforming a project.
   * @event
   */
  static EVENT_BEGIN = "begin";
  /**
   * Triggered when the {@link Serializer} has finished transforming a project.
   * @event
   */
  static EVENT_END = "end";
  serializers = [];
  /**
   * Only set when serializing.
   */
  projectRoot;
  /**
   * Only set when serializing
   */
  project;
  addSerializer(serializer) {
    insertPrioritySorted2(this.serializers, serializer);
  }
  removeSerializer(serializer) {
    removeIfPresent(this.serializers, serializer);
  }
  toObject(value) {
    if (value === void 0) {
      return void 0;
    }
    return this.serializers.filter((s) => s.supports(value)).reduce(
      (val, s) => s.toObject(value, val, this),
      value.toObject(this)
    );
  }
  toObjectsOptional(value) {
    if (!value || value.length === 0) {
      return void 0;
    }
    return value.map((val) => this.toObject(val));
  }
  /**
   * Same as toObject but emits {@link Serializer.EVENT_BEGIN} and {@link Serializer.EVENT_END} events.
   * @param value
   */
  projectToObject(value, projectRoot) {
    this.projectRoot = projectRoot;
    this.project = value;
    const eventBegin = new SerializeEvent(value);
    this.trigger(_Serializer.EVENT_BEGIN, eventBegin);
    const project = this.toObject(value);
    const eventEnd = new SerializeEvent(value, project);
    this.trigger(_Serializer.EVENT_END, eventEnd);
    this.project = void 0;
    this.projectRoot = void 0;
    return project;
  }
};
export {
  Deserializer,
  schema_exports as JSONOutput,
  SerializeEvent,
  Serializer
};
