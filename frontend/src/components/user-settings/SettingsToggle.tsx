import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import type { EnabledToggle } from "@/hooks/useEnabledToggle";

type SettingsToggleProps = {
  label: string;
  errorText: string;
  toggle: EnabledToggle;
};

export function SettingsToggle({ label, errorText, toggle }: SettingsToggleProps) {
  if (toggle.isError) return <p className="rounded box bg-red text-white">{errorText}</p>;

  return (
    <Switch checked={toggle.enabled} isLoading={toggle.isLoading} onCheckedChange={toggle.toggle}>
      <div className="row gap-small centered">
        {label}
        {toggle.isPending && <Spinner />}
      </div>
    </Switch>
  );
}
