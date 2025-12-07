import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import type { VideoTemplate } from "@/pages/VideoProject";

interface TemplateSelectorProps {
  templates: VideoTemplate[];
  onSelect: (template: VideoTemplate) => void;
}

export function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  return (
    <div className="template-selector">
      <div className="template-intro">
        <h2 className="template-intro-title">What kind of ad are you creating?</h2>
        <p className="template-intro-description">
          Choose a template and Madison will set up the perfect structure for your video.
        </p>
      </div>

      <div className="template-grid">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            className="template-card"
            onClick={() => onSelect(template)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="template-icon">
              {template.icon}
            </div>

            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
            </div>

            <div className="template-meta">
              <span className="template-scenes">
                {template.sceneCount} scene{template.sceneCount !== 1 ? "s" : ""}
              </span>
              <span className="template-duration">
                <Clock className="w-3 h-3" />
                {template.defaultDuration}s
              </span>
            </div>

            <ChevronRight className="template-arrow" />
          </motion.button>
        ))}
      </div>

      <div className="template-tip">
        <span className="tip-icon">💡</span>
        <span className="tip-text">
          Most users choose <strong>Product Reveal</strong> for their first video
        </span>
      </div>
    </div>
  );
}
