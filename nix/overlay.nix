final: _prev:
let
  sources = import ../npins;
  meta = with builtins; fromTOML (readFile ../src/pyproject.toml);
in
{
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

  web-security-tracker = final.python3.pkgs.buildPythonPackage rec {
    pname = meta.project.name;
    inherit (meta.project) version;
    pyproject = true;

    src = final.nix-gitignore.gitignoreSourcePure [ ../.gitignore ] ../src;

    propagatedBuildInputs = with final.python3.pkgs; [
      # Nix python packages
      dataclass-wizard
      dj-database-url
      django-allauth
      django-debug-toolbar
      django-filter
      django-types
      django_4
      djangorestframework
      httpretty
      ipython
      psycopg2
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
      django-pgtrigger
      pytest
      pytest-django
    ];

    postInstall = ''
      mkdir -p $out/bin
      cp -v ${src}/manage.py $out/bin/manage.py
      chmod +x $out/bin/manage.py
      wrapProgram $out/bin/manage.py --prefix PYTHONPATH : "$PYTHONPATH"
      cp ${sources.htmx}/dist/htmx.min.js* $out/${final.python3.sitePackages}/webview/static/
    '';
  };
}
