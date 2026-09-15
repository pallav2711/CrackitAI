/**
 * ResumePDF — @react-pdf/renderer document for resume download
 *
 * Usage:
 *   import { downloadResumePDF } from './ResumePDF';
 *   downloadResumePDF(resumeData, 'My_Resume.pdf');
 */
import {
  Document, Page, Text, View, StyleSheet, Link, pdf,
} from '@react-pdf/renderer';

// ── Styles ─────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily:  'Helvetica',
    fontSize:    10,
    color:       '#111111',
    paddingTop:  36,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight:  1.4,
  },

  // Header
  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#111111',
  },
  name: {
    fontSize:    22,
    fontFamily:  'Helvetica-Bold',
    color:       '#111111',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  contactItem: {
    fontSize:  9,
    color:     '#555555',
  },
  contactLink: {
    fontSize:  9,
    color:     '#2563EB',
  },

  // Section
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize:      10,
    fontFamily:    'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color:         '#111111',
    borderBottomWidth: 1.5,
    borderBottomColor: '#111111',
    paddingBottom: 3,
    marginBottom:  7,
  },

  // Summary
  summary: {
    fontSize:   10,
    color:      '#333333',
    lineHeight: 1.5,
  },

  // Experience / Education entries
  entry: {
    marginBottom: 9,
  },
  entryHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   2,
  },
  entryTitle: {
    fontSize:   10,
    fontFamily: 'Helvetica-Bold',
    color:      '#111111',
    flex:       1,
  },
  entryDate: {
    fontSize: 9,
    color:    '#666666',
    flexShrink: 0,
    marginLeft: 8,
  },
  entrySubtitle: {
    fontSize:   9.5,
    color:      '#444444',
    marginBottom: 3,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom:  2,
    paddingLeft:   2,
  },
  bulletDot: {
    fontSize:     9.5,
    color:        '#555',
    marginRight:  5,
    width:        8,
    flexShrink:   0,
  },
  bulletText: {
    fontSize:    9.5,
    color:       '#333333',
    flex:        1,
    lineHeight:  1.45,
  },

  // Skills
  skillsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
  },
  skillCategory: {
    marginBottom: 5,
  },
  skillLabel: {
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    color:      '#555555',
    marginRight: 4,
  },
  skillValue: {
    fontSize: 9.5,
    color:    '#333333',
  },

  // Projects
  projectName: {
    fontSize:   10,
    fontFamily: 'Helvetica-Bold',
    color:      '#111111',
  },
  projectDesc: {
    fontSize:   9.5,
    color:      '#444444',
    marginTop:  1,
    lineHeight: 1.4,
  },
  projectTech: {
    fontSize:  9,
    color:     '#666666',
    marginTop: 1,
  },

  // Certifications
  certRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   4,
  },
  certName: {
    fontSize:   9.5,
    fontFamily: 'Helvetica-Bold',
    color:      '#111111',
  },
  certIssuer: {
    fontSize: 9,
    color:    '#666666',
  },
  certDate: {
    fontSize: 9,
    color:    '#888888',
  },

  // Footer
  footer: {
    position:    'absolute',
    bottom:      20,
    left:        40,
    right:       40,
    textAlign:   'center',
    fontSize:    8,
    color:       '#999999',
    borderTopWidth: 0.5,
    borderTopColor: '#dddddd',
    paddingTop:  6,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
};

const safeText = (v) => (v == null || v === '' ? '' : String(v));

// ── Document component ──────────────────────────────────────────────────────
const ResumeDocument = ({ data }) => {
  const p = data.personalInfo || {};
  const hasSkills =
    (data.skills?.technical?.length || 0) +
    (data.skills?.tools?.length      || 0) +
    (data.skills?.soft?.length       || 0) +
    (data.skills?.languages?.length  || 0) > 0;

  return (
    <Document
      title={safeText(p.fullName) || 'Resume'}
      author={safeText(p.fullName)}
      creator="CrackIt AI"
    >
      <Page size="A4" style={S.page}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={S.header}>
          <Text style={S.name}>{safeText(p.fullName) || 'Your Name'}</Text>
          <View style={S.contactRow}>
            {p.email    && <Text style={S.contactItem}>{p.email}</Text>}
            {p.phone    && <Text style={S.contactItem}>{p.phone}</Text>}
            {p.location && <Text style={S.contactItem}>{p.location}</Text>}
            {p.linkedin && <Link src={p.linkedin} style={S.contactLink}>LinkedIn</Link>}
            {p.github   && <Link src={p.github}   style={S.contactLink}>GitHub</Link>}
            {p.portfolio && <Link src={p.portfolio} style={S.contactLink}>Portfolio</Link>}
          </View>
        </View>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {p.summary && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Professional Summary</Text>
            <Text style={S.summary}>{safeText(p.summary)}</Text>
          </View>
        )}

        {/* ── Experience ──────────────────────────────────────────────────── */}
        {data.experience?.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={S.entry}>
                <View style={S.entryHeader}>
                  <Text style={S.entryTitle}>{safeText(exp.position)}</Text>
                  <Text style={S.entryDate}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={S.entrySubtitle}>
                  {safeText(exp.company)}{exp.location ? ` · ${exp.location}` : ''}
                </Text>
                {(exp.description || []).filter(Boolean).map((d, j) => (
                  <View key={j} style={S.bullet}>
                    <Text style={S.bulletDot}>•</Text>
                    <Text style={S.bulletText}>{safeText(d)}</Text>
                  </View>
                ))}
                {(exp.achievements || []).filter(Boolean).map((a, j) => (
                  <View key={`ach-${j}`} style={S.bullet}>
                    <Text style={S.bulletDot}>★</Text>
                    <Text style={S.bulletText}>{safeText(a)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Education ───────────────────────────────────────────────────── */}
        {data.education?.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={S.entry}>
                <View style={S.entryHeader}>
                  <Text style={S.entryTitle}>
                    {safeText(edu.degree)}{edu.field ? ` in ${edu.field}` : ''}
                  </Text>
                  <Text style={S.entryDate}>
                    {edu.endDate ? formatDate(edu.endDate) : ''}
                  </Text>
                </View>
                <Text style={S.entrySubtitle}>
                  {safeText(edu.institution)}{edu.location ? ` · ${edu.location}` : ''}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ──────────────────────────────────────────────────────── */}
        {hasSkills && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Skills</Text>
            {data.skills?.technical?.length > 0 && (
              <View style={S.skillCategory}>
                <Text>
                  <Text style={S.skillLabel}>Technical: </Text>
                  <Text style={S.skillValue}>{data.skills.technical.join(', ')}</Text>
                </Text>
              </View>
            )}
            {data.skills?.tools?.length > 0 && (
              <View style={S.skillCategory}>
                <Text>
                  <Text style={S.skillLabel}>Tools: </Text>
                  <Text style={S.skillValue}>{data.skills.tools.join(', ')}</Text>
                </Text>
              </View>
            )}
            {data.skills?.soft?.length > 0 && (
              <View style={S.skillCategory}>
                <Text>
                  <Text style={S.skillLabel}>Soft Skills: </Text>
                  <Text style={S.skillValue}>{data.skills.soft.join(', ')}</Text>
                </Text>
              </View>
            )}
            {data.skills?.languages?.length > 0 && (
              <View style={S.skillCategory}>
                <Text>
                  <Text style={S.skillLabel}>Languages: </Text>
                  <Text style={S.skillValue}>{data.skills.languages.join(', ')}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Projects ────────────────────────────────────────────────────── */}
        {data.projects?.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={S.entry}>
                <Text style={S.projectName}>{safeText(proj.name)}</Text>
                {proj.description && (
                  <Text style={S.projectDesc}>{safeText(proj.description)}</Text>
                )}
                {proj.technologies?.length > 0 && (
                  <Text style={S.projectTech}>
                    Technologies: {proj.technologies.join(', ')}
                  </Text>
                )}
                {(proj.highlights || []).filter(Boolean).map((h, j) => (
                  <View key={j} style={S.bullet}>
                    <Text style={S.bulletDot}>•</Text>
                    <Text style={S.bulletText}>{safeText(h)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Certifications ──────────────────────────────────────────────── */}
        {data.certifications?.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, i) => (
              <View key={i} style={S.certRow}>
                <View>
                  <Text style={S.certName}>{safeText(cert.name)}</Text>
                  {cert.issuer && <Text style={S.certIssuer}>{cert.issuer}</Text>}
                </View>
                {cert.date && (
                  <Text style={S.certDate}>{formatDate(cert.date)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Text style={S.footer} fixed>
          Generated by CrackIt AI · crackiitai.vercel.app
        </Text>

      </Page>
    </Document>
  );
};

// ── Public helper ──────────────────────────────────────────────────────────
export const downloadResumePDF = async (data, filename) => {
  const name     = data.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume';
  const safeName = filename || `${name}_Resume.pdf`;
  const blob     = await pdf(<ResumeDocument data={data} />).toBlob();
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default ResumeDocument;
