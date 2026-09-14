import { useState } from 'react';
import { Plus, Trash2, FolderGit2 } from 'lucide-react';

const ProjectsStep = ({ data, updateData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addProject = () => {
    const newProject = {
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      highlights: ['']
    };
    updateData('projects', [...data.projects, newProject]);
    setExpandedIndex(data.projects.length);
  };

  const removeProject = (index) => {
    updateData('projects', data.projects.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateData('projects', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Projects</h2>
          <p className="text-nb-black/55">Showcase your work and side projects</p>
        </div>
        <button onClick={addProject} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {data.projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FolderGit2 className="w-12 h-12 text-nb-black/35 mx-auto mb-3" />
          <p className="text-nb-black/45 mb-4">No projects added yet</p>
          <button onClick={addProject} className="btn btn-secondary">
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.projects.map((project, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <FolderGit2 className="w-5 h-5 text-nb-black" />
                  <h3 className="font-semibold">{project.name || 'Project Name'}</h3>
                </button>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-nb-red p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedIndex === index && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className="nb-input"
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Description
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="nb-input min-h-[80px]"
                      placeholder="Brief description of the project..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Project Link
                      </label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                        className="nb-input"
                        placeholder="https://project.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        GitHub Repository
                      </label>
                      <input
                        type="url"
                        value={project.github}
                        onChange={(e) => updateProject(index, 'github', e.target.value)}
                        className="nb-input"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                      className="nb-input"
                      placeholder="React, Node.js, MongoDB"
                    />
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

export default ProjectsStep;
