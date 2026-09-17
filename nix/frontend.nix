{
  buildNpmPackage,
  biome,
  callPackage,
  lib,
}:
let
  schema = callPackage ./schema.nix { };
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

  npmDepsHash = "sha256-7sxnIR/OiQAZeGQ6PHOQQeFB6M/508piMet2/5U0sZc=";

  # Biome is used by the build scripts (lint check before build)
  nativeBuildInputs = [ biome ];

  # Generate the Orval API client from the OpenAPI schema before building.
  preBuild = ''
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
    dontBuild = true;
    installPhase = ''
      mkdir $out
      mv node_modules $out/
      mkdir $out/node_modules/.vite
      ln -s .bin $out/node_modules/bin
    '';
  };
})
