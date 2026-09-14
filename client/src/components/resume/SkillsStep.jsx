import { useState } from 'react';
import { Plus, X, Code } from 'lucide-react';

const SkillsStep = ({ data, updateData }) => {
  const [newSkill, setNewSkill] = useState({ technical: '', soft: '', tools: '', languages: '' });

  const addSkill = (category) => {
    if (newSkill[category].trim()) {
      const updated = {
        ...data.skills,
        [category]: [...(data.skills[category] || []), newSkill[category].trim()]
      };
      updateData('skills', updated);
      setNewSkill({ ...newSkill, [category]: '' });
    }
  };

  const removeSkill = (category, index) => {
    const updated = {
      ...data.skills,
      [category]: data.skills[category].filter((_, i) => i !== index)
    };
    updateData('skills', updated);
  };

  const SkillCategory = ({ title, category, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-nb-black/75 mb-2">{title}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSkill[category]}
          onChange={(e) => setNewSkill({ ...newSkill, [category]: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && addSkill(category)}
          className="nb-input flex-1"
          placeholder={placeholder}
        />
        <button
          onClick={() => addSkill(category)}
          className="btn btn-primary px-4"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(data.skills[category] || []).map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-nb-black text-nb-black rounded-full text-sm"
          >
            {skill}
            <button
              onClick={() => removeSkill(category, index)}
              className="hover:text-nb-black"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Skills</h2>
        <p className="text-nb-black/55">Add your technical and soft skills</p>
      </div>

      <div className="space-y-6">
        <SkillCategory
          title="Technical Skills"
          category="technical"
          placeholder="e.g., JavaScript, Python, React"
        />
        <SkillCategory
          title="Tools & Technologies"
          category="tools"
          placeholder="e.g., Git, Docker, AWS"
        />
        <SkillCategory
          title="Soft Skills"
          category="soft"
          placeholder="e.g., Leadership, Communication"
        />
        <SkillCategory
          title="Languages"
          category="languages"
          placeholder="e.g., English (Native), Spanish (Fluent)"
        />
      </div>
    </div>
  );
};

export default SkillsStep;
