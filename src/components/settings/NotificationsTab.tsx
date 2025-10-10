import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const notificationSettings = [
  {
    id: "generation-complete",
    title: "Content Generation Complete",
    description: "Get notified when AI finishes generating content",
    defaultValue: true,
  },
  {
    id: "scheduled-published",
    title: "Scheduled Content Published",
    description: "Receive alerts when scheduled content goes live",
    defaultValue: true,
  },
  {
    id: "team-activity",
    title: "Team Activity",
    description: "Updates when team members create or edit content",
    defaultValue: true,
  },
  {
    id: "weekly-summary",
    title: "Weekly Summary",
    description: "Receive a weekly digest of your content activity",
    defaultValue: false,
  },
  {
    id: "product-updates",
    title: "Product Updates",
    description: "Learn about new features and improvements",
    defaultValue: false,
  },
];

export function NotificationsTab() {
  const [settings, setSettings] = useState(
    notificationSettings.reduce((acc, setting) => ({
      ...acc,
      [setting.id]: setting.defaultValue,
    }), {} as Record<string, boolean>)
  );

  const handleToggle = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-paper-light border border-cream-dark rounded-xl p-8">
      <h2 className="text-2xl font-serif text-charcoal mb-6">Notification Preferences</h2>

      <div className="space-y-0">
        {notificationSettings.map((setting, index) => (
          <div
            key={setting.id}
            className={`flex items-center justify-between py-4 ${
              index !== notificationSettings.length - 1 ? "border-b border-cream-dark" : ""
            }`}
          >
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">{setting.title}</h3>
              <p className="text-sm text-neutral-600 mt-1">{setting.description}</p>
            </div>

            <Switch
              checked={settings[setting.id]}
              onCheckedChange={() => handleToggle(setting.id)}
              className="data-[state=checked]:bg-brass"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
