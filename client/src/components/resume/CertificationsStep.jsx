import { useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';

const CertificationsStep = ({ data, updateData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addCertification = () => {
    const newCert = {
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    updateData('certifications', [...data.certifications, newCert]);
    setExpandedIndex(data.certifications.length);
  };

  const removeCertification = (index) => {
    updateData('certifications', data.certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index, field, value) => {
    const updated = [...data.certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateData('certifications', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Certifications</h2>
          <p className="text-nb-black/55">Add your professional certifications</p>
        </div>
        <button onClick={addCertification} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {data.certifications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Award className="w-12 h-12 text-nb-black/35 mx-auto mb-3" />
          <p className="text-nb-black/45 mb-4">No certifications added yet</p>
          <button onClick={addCertification} className="btn btn-secondary">
            Add Certification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.certifications.map((cert, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <Award className="w-5 h-5 text-nb-black" />
                  <div>
                    <h3 className="font-semibold">{cert.name || 'Certification Name'}</h3>
                    <p className="text-sm text-nb-black/45">{cert.issuer || 'Issuer'}</p>
                  </div>
                </button>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-red-500 hover:text-nb-red p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedIndex === index && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Certification Name *
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="nb-input"
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      className="nb-input"
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="month"
                        value={cert.date ? cert.date.substring(0, 7) : ''}
                        onChange={(e) => updateCertification(index, 'date', e.target.value)}
                        className="nb-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nb-black/75 mb-2">
                        Expiry Date (if applicable)
                      </label>
                      <input
                        type="month"
                        value={cert.expiryDate ? cert.expiryDate.substring(0, 7) : ''}
                        onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                        className="nb-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={cert.credentialId}
                      onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                      className="nb-input"
                      placeholder="ABC123XYZ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nb-black/75 mb-2">
                      Credential URL
                    </label>
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) => updateCertification(index, 'url', e.target.value)}
                      className="nb-input"
                      placeholder="https://..."
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

export default CertificationsStep;
