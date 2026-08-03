{
  buildNpmPackage,
  biome,
  callPackage,
}:
let
  schema = callPackage ./schema.nix { };
in
buildNpmPackage {
  pname = "nix-security-tracker-frontend";
  version = "0.1.0";

  src = ../frontend;

  npmDepsHash = "sha256-65rKxAW6Gf/FA5sb79gcP+LTX7U+R9G9KZPK/jVdF1M=";

  # Biome is used by the build scripts (lint check before build)
  nativeBuildInputs = [ biome ];

  # Generate the Orval API client from the OpenAPI schema before `npm run build`.
  # The generated client (src/api/generated/) is git-ignored, so it must be
  # produced here for `tsc`/`vite build` to resolve its imports.
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
}
