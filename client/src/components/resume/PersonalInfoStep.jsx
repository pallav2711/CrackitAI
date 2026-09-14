import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

const PersonalInfoStep = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData('personalInfo', {
      ...data.personalInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
        <p className="text-nb-black/55">Let's start with your basic information</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="text"
              value={data.personalInfo.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="nb-input pl-10"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="nb-input pl-10"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="tel"
              value={data.personalInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="nb-input pl-10"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="text"
              value={data.personalInfo.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="nb-input pl-10"
              placeholder="San Francisco, CA"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            LinkedIn Profile
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="url"
              value={data.personalInfo.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="nb-input pl-10"
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            GitHub Profile
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="url"
              value={data.personalInfo.github}
              onChange={(e) => handleChange('github', e.target.value)}
              className="nb-input pl-10"
              placeholder="github.com/johndoe"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Portfolio Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nb-black/35" />
            <input
              type="url"
              value={data.personalInfo.portfolio}
              onChange={(e) => handleChange('portfolio', e.target.value)}
              className="nb-input pl-10"
              placeholder="johndoe.com"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <label className="block text-sm font-medium text-nb-black/75 mb-2">
            Professional Summary
          </label>
          <textarea
            value={data.personalInfo.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="nb-input min-h-[120px]"
            placeholder="Write a brief summary about yourself, your experience, and career goals..."
            rows={5}
          />
          <p className="text-xs text-nb-black/45 mt-1">
            Tip: Keep it concise (2-3 sentences) and highlight your key strengths
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
