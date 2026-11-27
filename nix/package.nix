{
  buildPythonPackage,
  python,
  callPackage,
  setuptools,
  nix-gitignore,
  nix-security-tracker-logos,
  sources,

  # dependencies
  dataclass-wizard,
  dj-database-url,
  django-allauth,
  django-debug-toolbar,
  django-filter,
  django-types,
  django,
  djangorestframework,
  ipython,
  pydantic-settings,
  prometheus-client,
  pygithub,
  requests,
  django-pgpubsub,
  gunicorn,
  aiofiles,
  sentry-sdk,
  django-pghistory,
  django-pglock,
  django-pgtrigger,
  django-prometheus,
  cvss,
  cpe,
  univers,
  django-model-utils,
  drf-spectacular,
  django-rest-knox,
  django-vite,

  # tests
  freezegun,
  graphql-core,
  pytest,
  pytest-django,
  playwright,
  pytest-playwright,
  pytest-mock,
  pytest-socket,
  responses,
}:
let
  pyprojectToml = with builtins; fromTOML (readFile ../src/pyproject.toml);
in
buildPythonPackage (finalAttrs: {
  pname = pyprojectToml.project.name;
  inherit (pyprojectToml.project) version;
  pyproject = true;
  build-system = [ setuptools ];

  src = nix-gitignore.gitignoreSourcePure [ ../.gitignore ] ../src;

  dependencies = [
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
    django-pgpubsub
    gunicorn
    aiofiles
    sentry-sdk
    django-pghistory
    django-pglock
    django-pgtrigger
    django-prometheus
    cvss
    cpe
    univers
    django-model-utils
    drf-spectacular
    django-rest-knox
    django-vite
    (callPackage ./github-graphql-types {
      inherit (sources) github-graphql-schema;
    })
  ];

  nativeCheckInputs = [
    freezegun
    graphql-core
    pytest
    pytest-django
    pytest-playwright
    pytest-mock
    pytest-socket
    responses
  ];

  pythonImportsCheck = [
    "api"
    "feeds"
    "project"
    "shared"
    "webview"
  ];

  passthru = {
    # buildPythonPackage moves these to nativeInstallCheckInputs and dependencies to passthru
    nativeCheckInputs = finalAttrs.nativeInstallCheckInputs;
    PLAYWRIGHT_BROWSERS_PATH = playwright.driver.browsers;
    pythonEnv = python.withPackages (
      _: finalAttrs.passthru.dependencies ++ finalAttrs.passthru.nativeCheckInputs
    );
  };

  postInstall = ''
    install -Dm755 ${finalAttrs.src}/manage.py $out/bin/manage.py
    wrapProgram $out/bin/manage.py --prefix PYTHONPATH : "$PYTHONPATH"
    install -Dm644 -t $out/${python.sitePackages}/webview/static/ ${nix-security-tracker-logos}/*
  '';
})
