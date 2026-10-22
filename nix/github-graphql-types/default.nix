{
  stdenv,
  python,
  toPythonModule,
  graphql-core,
  sgqlc,
  github-graphql-schema,
}:
let
  codegen = python.withPackages (_: [
    graphql-core
    sgqlc
  ]);
in
toPythonModule (
  stdenv.mkDerivation {
    name = "github-graphql-types";
    dontUnpack = true;
    dontConfigure = true;
    dontBuild = true;
    nativeBuildInputs = [ codegen ];
    propagatedBuildInputs = [ sgqlc ];
    installPhase = ''
      mkdir -p $out/${python.sitePackages}/github_graphql
      cp ${github-graphql-schema} $out/${python.sitePackages}/github_graphql/schema.graphql
      python ${./codegen.py} < ${github-graphql-schema} > $out/${python.sitePackages}/github_graphql/__init__.py
      mkdir -p $out/${python.sitePackages}/sgqlc-stubs/operation
      cp ${./operation.pyi} $out/${python.sitePackages}/sgqlc-stubs/operation/__init__.pyi
      echo partial > $out/${python.sitePackages}/sgqlc-stubs/py.typed
    '';
    doInstallCheck = true;
    installCheckPhase = ''
      PYTHONPATH=$out/${python.sitePackages} python ${builtins.toFile "check.py" ''
        import github_graphql

        assert github_graphql.PullRequest.__annotations__["number"] == "int"
        assert (
            github_graphql.PullRequest.__annotations__["state"]
            == "_typing.Literal['CLOSED', 'MERGED', 'OPEN']"
        )
      ''}
    '';
  }
)
