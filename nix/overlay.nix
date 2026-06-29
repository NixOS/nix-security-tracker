final: prev:
let
  sources = import ../npins;
  meta = with builtins; fromTOML (readFile ../src/pyproject.toml);
  release-channels = builtins.toFile "_release_channels.py" "channels = ${builtins.toJSON (import "${sources.infra}/channels.nix").channels}\n";
in
{
  /*
    XXX(@fricklerhandwerk): At the time of writing, Nixpkgs has Django 4 as default.
    Some packages that depend on Django use that default implicitly, so we override it for everything.
  */
  python3 = prev.python3.override {
    packageOverrides = pyfinal: _pyprev: {
      django = pyfinal.django_5;
      psycopg2 = pyfinal.psycopg;
      django-rest-knox = pyfinal.buildPythonPackage rec {
        pname = "django-rest-knox";
        version = "5.0.4";
        format = "setuptools";

        src = pyfinal.fetchPypi {
          pname = "django_rest_knox";
          inherit version;
          hash = "sha256-AVXA3z1fZoENmOFtImYD/MoiTBzEwSg/r1abcrcmyTw=";
        };

        propagatedBuildInputs = with pyfinal; [
          django
          djangorestframework
        ];

        doCheck = false;
      };
    };
  };
  # go through the motions to make a flake-incompat project use the build
  # inputs we want
  pre-commit-hooks = final.callPackage "${sources.pre-commit-hooks}/nix/run.nix" {
    tools = import "${sources.pre-commit-hooks}/nix/call-tools.nix" final;
    # wat
    gitignore-nix-src = {
      lib = import sources.gitignore { inherit (final) lib; };
    };
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
      pytest-socket
      ipython
      pydantic-settings
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
      pytest
      pytest-django
      pytest-playwright
      pytest-mock
      cvss
      freezegun
      django-model-utils
      drf-spectacular
      django-rest-knox
      django-vite
    ];

    passthru = {
      PLAYWRIGHT_BROWSERS_PATH = final.playwright-driver.browsers;
      inherit release-channels;
    };

    postInstall = ''
      mkdir -p $out/bin
      cp -v ${src}/manage.py $out/bin/manage.py
      chmod +x $out/bin/manage.py
      wrapProgram $out/bin/manage.py --prefix PYTHONPATH : "$PYTHONPATH"
      cp ${sources.htmx}/dist/htmx.min.js* $out/${final.python3.sitePackages}/webview/static/
      cp ${sources.nixos-logo} $out/${final.python3.sitePackages}/webview/static/nixos-logo.svg
      cp ${release-channels} $out/${final.python3.sitePackages}/shared/_release_channels.py
    '';
  };
}
