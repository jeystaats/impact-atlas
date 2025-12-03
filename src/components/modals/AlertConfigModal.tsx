"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icons";
import { Bell, BellRing, Mail, MessageSquare, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  condition: "above" | "below" | "change";
  threshold: number;
  unit: string;
  notifyVia: ("email" | "push" | "sms")[];
  enabled: boolean;
}

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  onSaveAlert?: (alert: AlertConfig) => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Metric presets based on module type
const metricPresets: Record<string, Array<{ id: string; name: string; unit: string; defaultThreshold: number }>> = {
  "urban-heat": [
    { id: "temperature", name: "Temperature Anomaly", unit: "°C", defaultThreshold: 5 },
    { id: "hotspots", name: "New Hotspots Detected", unit: "count", defaultThreshold: 3 },
    { id: "severity", name: "Severity Score", unit: "1-10", defaultThreshold: 7 },
  ],
  "coastal-plastic": [
    { id: "debris-volume", name: "Debris Volume", unit: "kg", defaultThreshold: 500 },
    { id: "accumulation-rate", name: "Accumulation Rate", unit: "kg/day", defaultThreshold: 50 },
    { id: "hotspots", name: "Critical Zones", unit: "count", defaultThreshold: 2 },
  ],
  "ocean-plastic": [
    { id: "density", name: "Plastic Density", unit: "items/km²", defaultThreshold: 100 },
    { id: "patches", name: "New Patches Detected", unit: "count", defaultThreshold: 1 },
  ],
  "port-emissions": [
    { id: "co2", name: "CO₂ Emissions", unit: "tons", defaultThreshold: 500 },
    { id: "vessels", name: "High-Emission Vessels", unit: "count", defaultThreshold: 5 },
    { id: "aqi", name: "Air Quality Index", unit: "AQI", defaultThreshold: 100 },
  ],
  "biodiversity": [
    { id: "species-count", name: "Species Count Change", unit: "%", defaultThreshold: -10 },
    { id: "habitat-loss", name: "Habitat Area Loss", unit: "ha", defaultThreshold: 5 },
  ],
  "default": [
    { id: "severity", name: "Severity Score", unit: "1-10", defaultThreshold: 7 },
    { id: "hotspots", name: "Active Hotspots", unit: "count", defaultThreshold: 5 },
  ],
};

const conditionConfig = {
  above: { label: "Goes above", icon: TrendingUp, color: "#EF4444" },
  below: { label: "Falls below", icon: TrendingDown, color: "#3B82F6" },
  change: { label: "Changes by", icon: AlertTriangle, color: "#F59E0B" },
};

export function AlertConfigModal({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  onSaveAlert,
}: AlertConfigModalProps) {
  const metrics = metricPresets[moduleId] || metricPresets["default"];

  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [condition, setCondition] = useState<"above" | "below" | "change">("above");
  const [threshold, setThreshold] = useState(metrics[0].defaultThreshold);
  const [notifyVia, setNotifyVia] = useState<("email" | "push" | "sms")[]>(["email", "push"]);
  const [alertName, setAlertName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleNotification = (type: "email" | "push" | "sms") => {
    setNotifyVia((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (!alertName.trim()) {
      toast.error("Please enter an alert name");
      return;
    }

    if (notifyVia.length === 0) {
      toast.error("Please select at least one notification method");
      return;
    }

    setIsSaving(true);

    const alert: AlertConfig = {
      id: `alert-${Date.now()}`,
      name: alertName,
      metric: selectedMetric.id,
      condition,
      threshold,
      unit: selectedMetric.unit,
      notifyVia,
      enabled: true,
    };

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (onSaveAlert) {
        onSaveAlert(alert);
      }

      toast.success("Alert created!", {
        description: `You'll be notified when ${selectedMetric.name} ${conditionConfig[condition].label.toLowerCase()} ${threshold}${selectedMetric.unit}`,
        icon: <BellRing className="w-4 h-4" />,
      });

      onClose();
    } catch {
      toast.error("Failed to create alert");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMetricChange = (metricId: string) => {
    const metric = metrics.find((m) => m.id === metricId);
    if (metric) {
      setSelectedMetric(metric);
      setThreshold(metric.defaultThreshold);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-lg z-50 flex flex-col rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Set Alert</h2>
                  <p className="text-xs text-[var(--foreground-muted)]">{moduleName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close alert configuration"
                className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Alert Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Alert Name
                </label>
                <input
                  type="text"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  placeholder="e.g., High temperature warning"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
              </div>

              {/* Metric Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Monitor this metric
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {metrics.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricChange(metric.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                        selectedMetric.id === metric.id
                          ? "bg-[var(--accent-bg)] border-[var(--accent)]"
                          : "bg-[var(--background-tertiary)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
                      }`}
                    >
                      <span className="text-sm text-[var(--foreground)]">{metric.name}</span>
                      <span className="text-xs text-[var(--foreground-muted)]">{metric.unit}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Alert when value
                </label>
                <div className="flex gap-2">
                  {(Object.keys(conditionConfig) as ("above" | "below" | "change")[]).map((cond) => {
                    const config = conditionConfig[cond];
                    const CondIcon = config.icon;
                    return (
                      <button
                        key={cond}
                        onClick={() => setCondition(cond)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                          condition === cond
                            ? "border-[var(--accent)] bg-[var(--accent-bg)]"
                            : "border-[var(--border)] bg-[var(--background-tertiary)] hover:border-[var(--foreground-muted)]"
                        }`}
                      >
                        <CondIcon className="w-4 h-4" style={{ color: condition === cond ? config.color : "var(--foreground-muted)" }} />
                        <span className="text-sm text-[var(--foreground)]">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Threshold value
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                  />
                  <span className="text-sm text-[var(--foreground-muted)] min-w-[60px]">
                    {selectedMetric.unit}
                  </span>
                </div>
              </div>

              {/* Notification Methods */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Notify me via
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "email" as const, label: "Email", icon: Mail },
                    { id: "push" as const, label: "Push", icon: Bell },
                    { id: "sms" as const, label: "SMS", icon: MessageSquare },
                  ].map((method) => {
                    const isSelected = notifyVia.includes(method.id);
                    const MethodIcon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => toggleNotification(method.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent-bg)]"
                            : "border-[var(--border)] bg-[var(--background-tertiary)] hover:border-[var(--foreground-muted)]"
                        }`}
                      >
                        <MethodIcon className="w-4 h-4" style={{ color: isSelected ? "var(--accent)" : "var(--foreground-muted)" }} />
                        <span className="text-sm text-[var(--foreground)]">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-1">Alert Preview</p>
                <p className="text-sm text-[var(--foreground)]">
                  When <span className="font-medium text-[var(--accent)]">{selectedMetric.name}</span>{" "}
                  {conditionConfig[condition].label.toLowerCase()}{" "}
                  <span className="font-medium text-[var(--accent)]">{threshold} {selectedMetric.unit}</span>,
                  notify via {notifyVia.join(", ") || "..."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <BellRing className="w-4 h-4" />
                    Create Alert
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
