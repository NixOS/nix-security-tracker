final: prev:
let
  sources = import ../npins;
  meta = with builtins; fromTOML (readFile ../src/pyproject.toml);
in
{
  python3 = prev.python3.override {
    packageOverrides = pyfinal: _pyprev: {
      psycopg2 = pyfinal.psycopg;
      cpe = pyfinal.buildPythonPackage {
        pname = "cpe";
        version = "1.3.1";
        pyproject = true;
        build-system = [
          pyfinal.setuptools
        ];
        src = sources.cpe;
      };
    };
  };
  # go through the motions to make a flake-incompat project use the build
  # inputs we want
  pre-commit-hooks = final.callPackage "${sources.pre-commit-hooks}/nix/run.nix" {
    tools = import "${sources.pre-commit-hooks}/nix/call-tools.nix" final;
    isFlakes = false;
  };

  nix-security-tracker = final.python3.pkgs.buildPythonPackage rec {
    pname = meta.project.name;
    inherit (meta.project) version;
    pyproject = true;
    build-system = with final.python3.pkgs; [
      setuptools
      wheel
    ];

    src = final.nix-gitignore.gitignoreSourcePure [ ../.gitignore ] ../src;

    propagatedBuildInputs = with final.python3.pkgs; [
      # Nix python packages
      dataclass-wizard
      dj-database-url
      django-allauth
      django-debug-toolbar
      django-filter
      django-types
      django
      djangorestframework
      ipython
      pydantic-settings
      prometheus-client
      pygithub
      requests
      tqdm
      pyngo
      django-ninja
      django-pgpubsub
      daphne
      channels
      aiofiles
      sentry-sdk
      django-pghistory
      django-pglock
      django-pgtrigger
      cvss
      cpe
      django-model-utils
      drf-spectacular
      django-rest-knox
      django-vite
    ];

    nativeCheckInputs = with final.python3.pkgs; [
      freezegun
      pytest
      pytest-django
      pytest-playwright
      pytest-mock
      pytest-socket
    ];

    passthru = {
      inherit nativeCheckInputs;
      PLAYWRIGHT_BROWSERS_PATH = final.playwright-driver.browsers;
      pythonEnv = final.python3.withPackages (_: propagatedBuildInputs ++ nativeCheckInputs);
    };

    postInstall = ''
      mkdir -p $out/bin
      cp -v ${src}/manage.py $out/bin/manage.py
      chmod +x $out/bin/manage.py
      wrapProgram $out/bin/manage.py --prefix PYTHONPATH : "$PYTHONPATH"
      cp ${sources.htmx}/dist/htmx.min.js* $out/${final.python3.sitePackages}/webview/static/
      cp ${sources.nixos-logo} $out/${final.python3.sitePackages}/webview/static/nixos-logo.svg
    '';
  };
}
