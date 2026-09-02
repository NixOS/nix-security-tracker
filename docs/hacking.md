# Hacking

The service is implemented in Python using [Django](https://www.djangoproject.com/).
It is built and deployed with [Nix](https://nix.dev).

Local testing is done on a [NixOS virtual machine](https://nix.dev/tutorials/nixos/nixos-configuration-on-vm) (VM).

## Prerequisites

Follow the [quickstart guide](./quickstart.md) to run a local instance of the service.

## Interacting with the system

The [development VM](../nix/vm.nix) behaves like the production instance in almost every aspect.

The main difference is that source files in [`src/`](../src) and [`frontend/`](../frontend) are mounted from the host, so edits take effect without rebuilding.
The web server reloads automatically on change; background workers require a manual restart:

```console
systemctl restart nix-security-tracker-workers.target
```

The other difference is that startup and scheduled jobs turned off, as they're rarely needed for development.
Run them manually by picking from the available [management commands](https://docs.djangoproject.com/en/6.0/ref/django-admin/):

```console
manage help
```

## Local configuration extensions

You may want to adjust the development VM, such as by adding your own tools for debugging.

The directory `.local` is not tracked by version control, so you can use it for local customisations.
The VM configuration automatically imports `.local/default.nix` if it exists.
That file is expected to contain a NixOS module.

For example, to add programs to the environment:

```nix
# .local/default.nix
{ pkgs, ... }: {
  environment.systemPackages = with pkgs; [
    htop
    neovim
  ];
}
```

## Running tests

Run application tests in the development VM:

```console
manage test -- --pyargs shared
```

Set the `--pyargs` parameter to test one of [the available Django applications](../CONTRIBUTING.md#directory-structure).

Run [integration tests](../nix/tests/default.nix) from your host:

```console
nix-build -A tests
```

Interact with the virtual machines involved in a test:

```
$(nix-build -A tests.driverInteractive)/bin/nixos-test-driver
```

> [!NOTE]
> Integration tests run [on each pull request](../.github/workflows/builds.yaml) and include the application tests.

## Debugging

For debugging, the web server can be run separately on the console:

```console
systemctl stop nix-security-tracker-server
manage runserver
```

Adding a breakpoint to the source will make it stop at that point:

```python
import pdb
pdb.set_trace()
```

## SSH access to the development VM

In your [local configuration extension](#local-configuration-extensions), enable SSH on the VM and add your SSH public key for the `root` user:

```
# .local/default.nix
{ config, ... }: {
  services.sshd.enable = true;
  users.users.root.openssh.authorizedKeys.keyFiles = [ ~/.ssh/id_ed25519 ];

  virtualisation.forwardPorts = [
    rec {
      from = "host";
      host.port = guest.port + config.local.port-offset;
      guest.port = 22;
    }
  ];
}
```

Then connect to the VM:

```console
ssh root@localhost -p 50022
```

## Formatting

Run the formatter manually with:

```console
nix-shell --run format
```

> ![NOTE]
> A formatter is run [on each pull request](../.github/workflows/builds.yaml) and as one of the [pre-push Git hooks](../nix/git-hooks.nix).

## Changing the database schema

Whenever you add a field in the database schema, run:

```console
manage makemigrations
```

Then before starting the server again, run:

```
manage migrate
```

This is the default Django workflow.

## Resetting the database

Generate a dedicated keypair on your host:

```console
mkdir -p .local/ssh
ssh-keygen -t ed25519 -N "" -f .local/ssh/id_ed25519
```

Then [request SSH access to a public instance](../infra/README.md#adding-ssh-keys) for the public key.

Expose the keypair to the development VM through your [local configuration extension](../CONTRIBUTING.md#local-configuration-extensions):

```nix
# .local/default.nix
{ ... }:
{
  virtualisation.sharedDirectories.ssh = {
    source = toString ./ssh;
    target = "/root/.ssh";
  };
}
```

Once you have access, delete the database and recreate it, then restore it from a dump, and (just in case the dump is behind the code) run migrations:

```bash
systemctl stop nix-security-tracker.target
dropdb nix-security-tracker
ssh dump-db@tracker-staging.security.nixos.org | zstdcat | pv | psql -U postgres
manage migrate
systemctl start nix-security-tracker.target
```
