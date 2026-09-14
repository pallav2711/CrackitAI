import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, FileText, TrendingUp, XCircle, Download, History } from 'lucide-react';
import { resumeScannerService } from '../services/resumeScannerService';

const ResumeScanner = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleScan(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleScan(droppedFile);
    }
  };

  const handleScan = async (fileToScan) => {
    setScanning(true);
    setError(null);
    
    try {
      const analysisResults = await resumeScannerService.scanResume(fileToScan);
      setResults(analysisResults);
    } catch (err) {
      setError(err.message);
      setFile(null);
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-nb-green';
    if (score >= 60) return 'text-nb-black';
    return 'text-nb-red';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-nb-green/10';
    if (score >= 60) return 'bg-nb-yellow/20';
    return 'bg-nb-red/10';
  };

  return (
    <div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 card bg-red-50 border-nb-red/30"
        >
          <div className="flex items-center gap-2 text-nb-red">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      {!results ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative card text-center py-20 border-2 border-dashed border-gray-300 hover:border-nb-black transition-all duration-300 group overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-nb-black text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={scanning}
            />
            <label htmlFor="resume-upload" className="cursor-pointer block relative z-10">
              <motion.div
                animate={scanning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: scanning ? Infinity : 0, duration: 1.5 }}
              >
                <Upload className="w-20 h-20 text-nb-black mx-auto mb-4 group-hover:scale-110 transition-transform" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3 text-nb-black">Upload Your Resume</h2>
              <p className="text-nb-black/55 mb-8 text-lg">
                {scanning ? 'Analyzing your resume...' : 'Drag and drop or click to upload'}
              </p>
              {scanning ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-nb-black"></div>
                  <p className="text-sm text-nb-black/45 font-medium">This may take a few seconds...</p>
                </div>
              ) : (
                <span className="btn btn-primary inline-block text-lg px-8 py-3 shadow-lg transition-shadow">
                  Choose File
                </span>
              )}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-nb-black/45">
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full">PDF</span>
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full">DOC</span>
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full">DOCX</span>
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full">Max 5MB</span>
              </div>
            </label>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="nb-card-compat transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-nb-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-nb-black">What We Check</h3>
              <ul className="text-sm text-nb-black/55 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span>
                  ATS compatibility score
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span>
                  Keyword optimization
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span>
                  Format and structure
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span>
                  Content quality
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span>
                  Section completeness
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="nb-card-compat transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-nb-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-nb-black">You'll Get</h3>
              <ul className="text-sm text-nb-black/55 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></span>
                  Overall ATS score
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></span>
                  Detailed feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></span>
                  Improvement suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></span>
                  Missing keywords
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></span>
                  Actionable recommendations
                </li>
              </ul>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative nb-card-compat"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
              
              
            </div>

            <div className="relative z-10 text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-32 h-32 border-3 border-nb-black bg-white mb-6"
                style={{ borderRadius: "6px", boxShadow: "4px 4px 0 #111111" }}
              >
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-5xl font-bold bg-nb-black`}
                  >
                    {results.atsScore}
                  </motion.div>
                  <div className="text-sm text-nb-black/55 font-semibold">ATS Score</div>
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-3"
              >
                {results.atsScore >= 80 ? '🎉 Excellent Resume!' : 
                 results.atsScore >= 60 ? '👍 Good Progress' : '💪 Needs Improvement'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 mb-2 text-lg"
              >
                {results.fileName}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-white/70"
              >
                {results.wordCount} words analyzed
              </motion.p>
            </div>
          </motion.div>

          {/* Detailed Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nb-card-compat"
          >
            <h3 className="text-xl font-bold mb-6 text-nb-black">Detailed Analysis</h3>
            <div className="space-y-4">
              {Object.entries(results.scores).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold capitalize text-nb-black/75">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-sm font-bold bg-nb-black px-3 py-1 rounded-full ${getScoreBgColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-3 rounded-full ${
                        value >= 80 ? 'bg-nb-black text-white' :
                        value >= 60 ? 'bg-nb-black text-white' : 
                        'bg-nb-black text-white'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Detected Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nb-card-compat"
          >
            <h3 className="text-xl font-bold mb-6 text-nb-black">Resume Sections</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(results.detectedSections).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                    value ? 'bg-green-50 text-nb-green border border-nb-green/30' : 'bg-[#F5F1E8] text-nb-black/45 border border-nb-black/15'
                  }`}
                >
                  {value ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nb-card-compat bg-green-50 border-nb-green/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-nb-black">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {results.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 text-nb-black/75 p-3 bg-white rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="nb-card-compat bg-red-50 border-nb-red/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-nb-black">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {results.weaknesses.map((weakness, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 text-nb-black/75 p-3 bg-white rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{weakness}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="nb-card-compat bg-blue-50 border-nb-blue/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-nb-black">Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {results.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 text-nb-black/75 p-3 bg-white rounded-lg"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-nb-black text-white text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </span>
                  <span className="font-medium">{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => {
                setFile(null);
                setResults(null);
                setError(null);
              }}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2 group"
            >
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Scan Another Resume
            </button>
            <button className="btn btn-primary flex-1 flex items-center justify-center gap-2 group">
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Download Report
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ResumeScanner;
