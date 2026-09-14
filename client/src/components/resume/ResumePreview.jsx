import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

const ResumePreview = ({ data }) => {
  return (
    <div className="nb-card-compat bg-white shadow-lg">
      <div className="bg-nb-black text-white text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.personalInfo.location}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-sm mt-2">
          {data.personalInfo.linkedin && (
            <a href={data.personalInfo.linkedin} className="flex items-center gap-1 hover:underline">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          {data.personalInfo.github && (
            <a href={data.personalInfo.github} className="flex items-center gap-1 hover:underline">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          {data.personalInfo.portfolio && (
            <a href={data.personalInfo.portfolio} className="flex items-center gap-1 hover:underline">
              <Globe className="w-4 h-4" />
              Portfolio
            </a>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        {data.personalInfo.summary && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-2 border-b-2 border-nb-black pb-1">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-nb-black/75 text-sm">{data.personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-3 border-b-2 border-nb-black pb-1">
              EXPERIENCE
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-nb-black">{exp.position}</h3>
                      <p className="text-nb-black/75">{exp.company}</p>
                    </div>
                    <div className="text-sm text-nb-black/55 text-right">
                      <p>{exp.location}</p>
                      <p>
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc list-inside text-sm text-nb-black/75 space-y-1">
                    {exp.description.filter(d => d).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-3 border-b-2 border-nb-black pb-1">
              EDUCATION
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-nb-black">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <p className="text-nb-black/75">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-nb-black/55">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-sm text-nb-black/55 text-right">
                    {edu.endDate && new Date(edu.endDate).getFullYear()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {(data.skills.technical?.length > 0 || data.skills.tools?.length > 0 || data.skills.soft?.length > 0) && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-3 border-b-2 border-nb-black pb-1">
              SKILLS
            </h2>
            <div className="space-y-2 text-sm">
              {data.skills.technical?.length > 0 && (
                <p><span className="font-semibold">Technical:</span> {data.skills.technical.join(', ')}</p>
              )}
              {data.skills.tools?.length > 0 && (
                <p><span className="font-semibold">Tools:</span> {data.skills.tools.join(', ')}</p>
              )}
              {data.skills.soft?.length > 0 && (
                <p><span className="font-semibold">Soft Skills:</span> {data.skills.soft.join(', ')}</p>
              )}
              {data.skills.languages?.length > 0 && (
                <p><span className="font-semibold">Languages:</span> {data.skills.languages.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-3 border-b-2 border-nb-black pb-1">
              PROJECTS
            </h2>
            <div className="space-y-3">
              {data.projects.map((project, index) => (
                <div key={index}>
                  <h3 className="font-bold text-nb-black">{project.name}</h3>
                  {project.description && <p className="text-sm text-nb-black/75">{project.description}</p>}
                  {project.technologies.length > 0 && (
                    <p className="text-sm text-nb-black/55">
                      <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-nb-black mb-3 border-b-2 border-nb-black pb-1">
              CERTIFICATIONS
            </h2>
            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold text-nb-black">{cert.name}</p>
                    <p className="text-nb-black/75">{cert.issuer}</p>
                  </div>
                  {cert.date && (
                    <p className="text-nb-black/55">
                      {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
