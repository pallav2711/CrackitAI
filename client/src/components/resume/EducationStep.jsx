import { useState } from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

const EducationStep = ({ data, updateData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addEducation = () => {
    const newEducation = {
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: ['']
    };
    updateData('education', [...data.education, newEducation]);
    setExpandedIndex(data.education.length);
  };

  const removeEducation = (index) => {
    const updated = data.education.filter((_, i) => i !== index);
    updateData('education', updated);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    updateData('education', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Education</h2>
          <p className="text-nb-black/55">Add your educational background</p>
        </div>
        <button onClick={addEducation} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {data.education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <GraduationCap className="w-12 h-12 text-nb-black/35 mx-auto mb-3" />
          <p className="text-nb-black/45 mb-4">No education added yet</p>
          <button onClick={addEducation} className="btn btn-secondary">
            Add Your Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <GraduationCap className="w-5 h-5 text-nb-black" />
                  <div>
                    <h3 className="font-semibold">
                      {edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-sm text-nb-black/45">{edu.institution || 'Institution'}</p>
                  </div>
                </button>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-nb-red p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedIndex === index && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Institution *
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="nb-input"
                      placeholder="University Name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Degree *
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="nb-input"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        className="nb-input"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        value={edu.startDate ? edu.startDate.substring(0, 7) : ''}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        className="nb-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={edu.endDate ? edu.endDate.substring(0, 7) : ''}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        className="nb-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        GPA (Optional)
                      </label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        className="nb-input"
                        placeholder="3.8/4.0"
                      />
                    </div>
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

export default EducationStep;
