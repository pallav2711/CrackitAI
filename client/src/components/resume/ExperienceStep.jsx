import { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';

const ExperienceStep = ({ data, updateData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addExperience = () => {
    const newExperience = {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
      achievements: ['']
    };
    updateData('experience', [...data.experience, newExperience]);
    setExpandedIndex(data.experience.length);
  };

  const removeExperience = (index) => {
    const updated = data.experience.filter((_, i) => i !== index);
    updateData('experience', updated);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateData('experience', updated);
  };

  const addDescriptionPoint = (index) => {
    const updated = [...data.experience];
    updated[index].description.push('');
    updateData('experience', updated);
  };

  const updateDescriptionPoint = (expIndex, pointIndex, value) => {
    const updated = [...data.experience];
    updated[expIndex].description[pointIndex] = value;
    updateData('experience', updated);
  };

  const removeDescriptionPoint = (expIndex, pointIndex) => {
    const updated = [...data.experience];
    updated[expIndex].description = updated[expIndex].description.filter((_, i) => i !== pointIndex);
    updateData('experience', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
          <p className="text-nb-black/55">Add your professional experience</p>
        </div>
        <button
          onClick={addExperience}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {data.experience.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Briefcase className="w-12 h-12 text-nb-black/35 mx-auto mb-3" />
          <p className="text-nb-black/45 mb-4">No experience added yet</p>
          <button onClick={addExperience} className="btn btn-secondary">
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <Briefcase className="w-5 h-5 text-nb-black" />
                  <div>
                    <h3 className="font-semibold">
                      {exp.position || 'Position'} {exp.company && `at ${exp.company}`}
                    </h3>
                    <p className="text-sm text-nb-black/45">
                      {exp.startDate && new Date(exp.startDate).getFullYear()}
                      {exp.endDate && ` - ${new Date(exp.endDate).getFullYear()}`}
                      {exp.current && ' - Present'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-nb-red p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedIndex === index && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="nb-input"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Position *
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="nb-input"
                        placeholder="Job Title"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      className="nb-input"
                      placeholder="City, State"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="month"
                        value={exp.startDate ? exp.startDate.substring(0, 7) : ''}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="nb-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={exp.endDate ? exp.endDate.substring(0, 7) : ''}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        className="nb-input"
                        disabled={exp.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      checked={exp.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                      className="w-4 h-4 text-nb-black rounded"
                    />
                    <label htmlFor={`current-${index}`} className="text-sm text-nb-black/75">
                      I currently work here
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Responsibilities & Achievements
                    </label>
                    {exp.description.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => updateDescriptionPoint(index, pointIndex, e.target.value)}
                          className="nb-input flex-1"
                          placeholder="• Describe your responsibility or achievement..."
                        />
                        {exp.description.length > 1 && (
                          <button
                            onClick={() => removeDescriptionPoint(index, pointIndex)}
                            className="text-red-500 hover:text-nb-red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addDescriptionPoint(index)}
                      className="text-sm text-nb-black hover:text-nb-black flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Point
                    </button>
                    <p className="text-xs text-nb-black/45 mt-2">
                      Tip: Start with action verbs and quantify achievements when possible
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceStep;
