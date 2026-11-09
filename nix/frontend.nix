{
  buildNpmPackage,
  biome,
  callPackage,
  lib,
}:
let
  schema = callPackage ./schema.nix { };
  # The date picker's deferred input sync can write the start date into the end input of a range.
  # FIXME(@fricklerhandwerk): Drop this once the upstream fix makes it into our dependencies:
  # https://github.com/chakra-ui/zag/pull/3586
  patch-dependencies = ''
    patch -p1 -d node_modules/@zag-js/date-picker < ${./zag-date-picker-stale-input.patch}
  '';
in
buildNpmPackage (finalAttrs: {
  pname = "nix-security-tracker-frontend";
  version = "0.1.0";

  src =
    with lib.fileset;
    toSource {
      root = ../frontend;
      fileset = intersection (gitTracked ../.) ../frontend;
    };

  npmDepsHash = "sha256-I+dAHB/1w8f3XWUXT+3JILa8BiAFL7TkSD2fQBdLWpY=";

  # Biome is used by the build scripts (lint check before build)
  nativeBuildInputs = [ biome ];

  # Generate the Orval API client from the OpenAPI schema before building.
  preBuild = ''
    ${patch-dependencies}
    cp ${schema} schema.yaml
    npm run generate-api:local
  '';

  npmBuildScript = "build";

  installPhase = ''
    runHook preInstall
    cp -r dist $out
    runHook postInstall
  '';

  passthru.dependencies = finalAttrs.finalPackage.overrideAttrs {
    src = lib.fileset.toSource {
      root = ../frontend;
      fileset = lib.fileset.unions [
        ../frontend/package.json
        ../frontend/package-lock.json
        ../frontend/.npmrc
      ];
    };
    preBuild = "";
    dontBuild = true;
    installPhase = ''
      ${patch-dependencies}
      mkdir $out
      mv node_modules $out/
      mkdir $out/node_modules/.vite
      ln -s .bin $out/node_modules/bin
    '';
  };
})
