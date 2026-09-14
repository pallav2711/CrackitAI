import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Clock, Send, ChevronRight,
  AlertCircle, CheckCircle, Loader, MessageSquare, Play, Pause, Award,
  Volume2, VolumeX
} from 'lucide-react';
import { interviewService } from '../services/interviewService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';


const InterviewTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasSpokenQuestion, setHasSpokenQuestion] = useState(false);
  
  // Media recording
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [videoConnected, setVideoConnected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // AI Voice
  const { speak, stop, speaking } = useSpeechSynthesis();

  // Update word count when answer changes
  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [answer]);

  // Speak question when it changes
  useEffect(() => {
    if (interview && voiceEnabled && !hasSpokenQuestion) {
      const question = interview.questions[currentQuestion];
      if (question) {
        // Add a greeting for the first question
        const greeting = currentQuestion === 0 
          ? "Hello! Welcome to your interview. Let's begin with the first question. " 
          : "";
        
        speak(greeting + question.question)
          .then(() => setHasSpokenQuestion(true))
          .catch(err => console.error('Speech error:', err));
      }
    }
  }, [interview, currentQuestion, voiceEnabled, hasSpokenQuestion, speak]);

  // Reset spoken flag when question changes
  useEffect(() => {
    setHasSpokenQuestion(false);
  }, [currentQuestion]);

  useEffect(() => {
    loadInterview();
    return () => {
      // Cleanup media streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  // Timer for current question
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [questionStartTime]);

  const loadInterview = async () => {
    try {
      let interviewData = await interviewService.getInterview(id);
      console.log('Interview loaded:', interviewData.status);
      
      // Start interview if not started
      if (interviewData.status === 'scheduled') {
        console.log('Starting interview...');
        try {
          interviewData = await interviewService.startInterview(id);
          console.log('Interview started successfully');
        } catch (startError) {
          // If already started by another request, just reload
          console.log('Interview already started, reloading...');
          interviewData = await interviewService.getInterview(id);
        }
      }
      
      // Check if interview is in valid state
      if (interviewData.status === 'completed') {
        console.log('Interview already completed, redirecting to results');
        navigate(`/interview-results/${id}`);
        return;
      }
      
      if (interviewData.status !== 'in-progress') {
        console.log('Interview not in progress, status:', interviewData.status);
      }
      
      setInterview(interviewData);
      
      // Setup media if needed
      if (interviewData.mode === 'voice' || interviewData.mode === 'video') {
        await setupMedia(interviewData.mode);
      }
    } catch (error) {
      console.error('Failed to load interview:', error);
      alert('Failed to load interview: ' + error.message);
      navigate('/mock-interview');
    } finally {
      setLoading(false);
    }
  };

  const setupMedia = async (mode) => {
    try {
      const constraints = {
        audio: true,
        video: mode === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      console.log('Setting up media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log('Media stream obtained:', stream);

      if (mode === 'video') {
        setVideoConnected(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, attempting to play');
            videoRef.current.play().catch(err => console.log('Video play failed:', err));
          };
        }
      }

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };

      setMediaRecorder(recorder);
      
      // Monitor stream for disconnection
      if (mode === 'video') {
        stream.getVideoTracks().forEach(track => {
          track.onended = () => {
            console.log('Video track ended');
            setVideoConnected(false);
          };
        });
      }
      
      console.log('Media setup completed successfully');
    } catch (error) {
      console.error('Failed to setup media:', error);
      setVideoConnected(false);
      alert('Failed to access microphone/camera. Please check permissions and ensure you\'re using HTTPS.');
    }
  };

  // Re-attach video stream when video element is re-rendered
  useEffect(() => {
    if (interview?.mode === 'video' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      // Ensure video plays after re-attachment
      videoRef.current.play().catch(err => console.log('Video play failed:', err));
    }
  }, [currentQuestion, interview?.mode]);

  // Additional effect to handle video stream re-attachment after DOM updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (interview?.mode === 'video' && videoRef.current && streamRef.current) {
        if (!videoRef.current.srcObject) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(err => console.log('Video play failed:', err));
        }
      }
    }, 100); // Small delay to ensure DOM is updated

    return () => clearTimeout(timer);
  }, [currentQuestion]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
      setRecording(true);
      setQuestionStartTime(Date.now());
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    setSubmitting(true);

    try {
      const duration = Math.floor((Date.now() - questionStartTime) / 1000);
      
      // For voice/video, convert recorded data to text (simplified - in production use speech-to-text API)
      let finalAnswer = answer;
      if (interview.mode !== 'text' && audioChunks.length > 0) {
        // In production, send audio to speech-to-text service
        finalAnswer = answer || '[Voice/Video response recorded]';
      }

      await interviewService.submitAnswer({
        interviewId: interview._id,
        questionIndex: currentQuestion,
        answer: finalAnswer || '',
        duration
      });

      // Move to next question or show complete modal
      if (currentQuestion < interview.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setAnswer('');
        setAudioChunks([]);
        setQuestionStartTime(Date.now());
        setElapsedTime(0);
        
        // Ensure video stream is still connected for next question
        if (interview.mode === 'video' && streamRef.current) {
          setTimeout(() => {
            if (videoRef.current && streamRef.current) {
              videoRef.current.srcObject = streamRef.current;
              videoRef.current.play().catch(err => console.log('Video play failed:', err));
            }
          }, 500); // Delay to ensure DOM is updated
        }
      } else {
        // Show completion modal
        setShowCompleteModal(true);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      const results = await interviewService.completeInterview(interview._id);
      navigate(`/interview-results/${results._id}`);
    } catch (error) {
      console.error('Failed to complete interview:', error);
      alert('Failed to complete interview');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nb-black mx-auto mb-4"></div>
          <p className="text-nb-black/55">Loading interview...</p>
        </div>
      </div>
    );
  }

  const question = interview.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-nb-black">{interview.role}</h1>
              <p className="text-sm text-nb-black/55 capitalize">
                {interview.type} Interview • Question {currentQuestion + 1} of {interview.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Voice Control */}
              <button
                onClick={() => {
                  if (speaking) {
                    stop();
                  } else {
                    setVoiceEnabled(!voiceEnabled);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  voiceEnabled 
                    ? 'bg-nb-green/10 text-nb-green hover:bg-green-200' 
                    : 'bg-[#F5F1E8] text-nb-black/75 hover:bg-gray-200'
                }`}
                title={voiceEnabled ? 'AI Voice: ON (Click to disable)' : 'AI Voice: OFF (Click to enable)'}
              >
                {speaking ? (
                  <>
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span className="text-sm">Speaking...</span>
                  </>
                ) : voiceEnabled ? (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span className="text-sm">Voice ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span className="text-sm">Voice OFF</span>
                  </>
                )}
              </button>

              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nb-blue/10 text-nb-blue font-semibold">
                <Clock className="w-5 h-5" />
                <span className="text-lg">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-nb-black text-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Preview (for video mode) - Compact sidebar */}
          {interview.mode === 'video' && (
            <div className="lg:col-span-1">
              <div className="nb-card-compat sticky top-24">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-nb-black">Camera</h3>
                    {videoConnected && streamRef.current ? (
                      <div className="flex items-center gap-1 text-nb-green bg-green-50 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-nb-green rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold">Live</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setupMedia('video')}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md font-semibold"
                        title="Reconnect camera"
                      >
                        Reconnect
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full rounded-lg bg-gray-900"
                    style={{ aspectRatio: '4/3' }}
                  />
                  {(!videoConnected || !streamRef.current) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                      <div className="text-center text-white">
                        <Video className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-xs opacity-75">Camera off</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={interview.mode === 'video' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="nb-card-compat h-fit"
              >
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-nb-black flex items-center justify-center">
                      <span className="text-nb-black font-bold text-sm">{currentQuestion + 1}</span>
                    </div>
                    <h2 className="text-lg font-bold text-nb-black">Question</h2>
                  </div>
                  <p className="text-base text-nb-black/60 leading-relaxed bg-[#F5F1E8] p-4 rounded-lg">
                    {question.question}
                  </p>
                </div>

                {/* Answer Input - Compact */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-nb-black/75 mb-2">
                    Your Answer
                  </label>

                  {interview.mode === 'text' ? (
                    <div>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here... (Aim for 50-100 words for best results)"
                        rows={6}
                        className="nb-input w-full resize-none"
                      />
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className={`font-semibold ${
                          wordCount === 0 ? 'text-nb-black/35' :
                          wordCount < 30 ? 'text-nb-red' :
                          wordCount < 50 ? 'text-nb-black' :
                          wordCount <= 100 ? 'text-nb-green' :
                          'text-nb-blue'
                        }`}>
                          {wordCount} words
                        </div>
                        <div className="text-nb-black/45 text-xs">
                          Recommended: 50-100 words
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Recording Controls - Compact */}
                      <div className="flex items-center justify-center gap-3 p-4 bg-[#F5F1E8] rounded-lg">
                        {!recording ? (
                          <button
                            onClick={startRecording}
                            className="btn btn-primary flex items-center gap-2 px-6 py-3"
                          >
                            <Mic className="w-5 h-5" />
                            Start Recording
                          </button>
                        ) : (
                          <button
                            onClick={stopRecording}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 animate-pulse"
                          >
                            <MicOff className="w-5 h-5" />
                            Stop Recording
                          </button>
                        )}
                      </div>

                      {audioChunks.length > 0 && (
                        <div className="flex items-center gap-2 text-nb-green bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold text-sm">Response recorded successfully</span>
                        </div>
                      )}

                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Optional: Add notes or key points..."
                        rows={3}
                        className="nb-input w-full resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Compact Tips */}
                <div className="bg-nb-black text-white border border-nb-blue/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-nb-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-nb-blue text-sm mb-1">💡 Quick Tips:</p>
                      <ul className="text-xs text-nb-blue space-y-1">
                        <li>• Be specific with real examples</li>
                        <li>• Use STAR method for behavioral questions</li>
                        <li>• Stay relevant and concise (50-100 words)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Always visible */}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || (interview.mode === 'text' && !answer.trim())}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-base font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : currentQuestion < interview.questions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Complete Interview
                    </>
                  )}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="nb-card-compat sticky top-24">
              <h3 className="font-semibold text-nb-black mb-3 text-sm">Progress</h3>
              
              {/* Compact Progress Indicators */}
              <div className="space-y-2 mb-4">
                {interview.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-md transition-all ${
                      index === currentQuestion
                        ? 'bg-[#F5F1E8] border border-nb-black'
                        : index < currentQuestion
                        ? 'bg-green-50 border border-nb-green/30'
                        : 'bg-[#F5F1E8] border border-nb-black/15'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === currentQuestion
                        ? 'bg-[#F5F1E8]0 text-white'
                        : index < currentQuestion
                        ? 'bg-nb-green text-white'
                        : 'bg-gray-300 text-nb-black/55'
                    }`}>
                      {index < currentQuestion ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      index === currentQuestion ? 'text-nb-black' : 'text-nb-black/55'
                    }`}>
                      Q{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-nb-black/55">Answered</span>
                  <span className="font-bold text-nb-green">{currentQuestion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-nb-black/55">Remaining</span>
                  <span className="font-bold text-nb-black">
                    {interview.questions.length - currentQuestion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-nb-black/55">Progress</span>
                  <span className="font-bold text-nb-black">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Interview Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-nb-black text-white flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  Great Job! 🎉
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-nb-black/55 mb-6"
                >
                  You've completed all {interview.questions.length} questions!
                  <br />
                  Let's see how you did.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleCompleteInterview}
                  disabled={submitting}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Calculating Results...
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      View My Results
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewTaking;