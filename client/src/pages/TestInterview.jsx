import { useState } from 'react';
import { interviewService } from '../services/interviewService';

const TestInterview = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCreate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = {
        type: 'hr',
        role: 'Software Engineer',
        experience: 'mid',
        difficulty: 'medium',
        questionCount: 3,
        mode: 'text'
      };

      console.log('Testing interview creation with:', data);
      const interview = await interviewService.createInterview(data);
      console.log('Success!', interview);
      setResult(interview);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Interview API</h1>

        <button
          onClick={testCreate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Create Interview'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-nb-red/10 border border-red-400 rounded-lg">
            <h3 className="font-bold text-nb-red">Error:</h3>
            <p className="text-nb-red">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-nb-green/10 border border-green-400 rounded-lg">
            <h3 className="font-bold text-nb-green">Success!</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-nb-blue/30 rounded-lg">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click "Test Create Interview"</li>
            <li>Check console for detailed logs</li>
            <li>Check result below</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestInterview;
