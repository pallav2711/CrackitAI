import { motion } from 'framer-motion';
import { 
  Star, ArrowRight, CheckCircle, Clock, Target, Calendar,
  Building2, Globe, Users, Zap, Brain
} from 'lucide-react';

const AICompanyCard = ({ company, index, viewMode, onCreatePlan, hasActivePlan }) => {
  
  const GridCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="nb-card-compat transition-all duration-300 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-nb-black text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* AI Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-nb-black text-white text-white rounded-full text-xs font-semibold">
            <Brain className="w-3 h-3" />
            AI Powered
          </div>
        </div>
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=6366f1&color=fff&size=128`;
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-nb-black group-hover:text-nb-black transition-colors">
                  {company.name}
                </h3>
                <p className="text-sm text-nb-black/45">{company.industry}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-[#F5F1E8] rounded-lg group-hover:bg-white transition-colors">
              <div className="text-2xl font-bold text-nb-black">
                {company.stats?.totalQuestions || 0}
              </div>
              <div className="text-xs text-nb-black/55">AI Questions</div>
            </div>
            <div className="text-center p-3 bg-[#F5F1E8] rounded-lg group-hover:bg-white transition-colors">
              <div className="text-2xl font-bold text-nb-green">
                {company.difficulty}
              </div>
              <div className="text-xs text-nb-black/55">Difficulty</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-nb-black/55">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>30/60/90 day plans</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-nb-black/55">
              <Target className="w-4 h-4 text-green-500" />
              <span>Adaptive learning path</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-nb-black/55">
              <Clock className="w-4 h-4 text-nb-blue" />
              <span>Weekly assessments</span>
            </div>
          </div>

          {/* Tech Stack Preview */}
          {company.techStack && company.techStack.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-nb-black/45 mb-2">Tech Stack:</div>
              <div className="flex flex-wrap gap-1">
                {company.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-nb-blue/10 text-nb-blue text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {company.techStack.length > 3 && (
                  <span className="px-2 py-1 bg-[#F5F1E8] text-nb-black/55 text-xs rounded-full">
                    +{company.techStack.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-nb-black/55 text-sm mb-4 line-clamp-2">
            {company.description}
          </p>

          {/* Action button */}
          {hasActivePlan ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-nb-green/10 text-nb-green rounded-lg font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Active Plan</span>
            </div>
          ) : (
            <button 
              onClick={onCreatePlan}
              className="w-full btn-primary group-hover:bg-nb-black transition-colors flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4" />
              <span>Create AI Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const ListCard = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 5 }}
    >
      <div className="nb-card-compat hover:shadow-lg transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <img 
              src={company.logo} 
              alt={`${company.name} logo`}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=6366f1&color=fff&size=128`;
              }}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-nb-black group-hover:text-nb-black transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 bg-nb-black text-white text-white rounded-full text-xs font-semibold">
                <Brain className="w-3 h-3" />
                AI
              </div>
            </div>
            <p className="text-sm text-nb-black/45 mb-2">{company.industry}</p>
            <div className="flex items-center gap-4 text-sm text-nb-black/55">
              <span>{company.stats?.totalQuestions || 0} AI questions</span>
              <span className={`px-2 py-1 rounded text-xs ${
                company.difficulty === 'Easy' ? 'bg-nb-green/10 text-nb-green' :
                company.difficulty === 'Medium' ? 'bg-nb-yellow/20 text-nb-black' :
                'bg-nb-red/10 text-nb-red'
              }`}>
                {company.difficulty}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>30-90 day plans</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {hasActivePlan ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-nb-green/10 text-nb-green rounded-lg font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Active</span>
              </div>
            ) : (
              <button 
                onClick={onCreatePlan}
                className="flex items-center gap-2 px-4 py-2 bg-nb-black text-white rounded-lg hover:bg-nb-black transition-colors font-semibold"
              >
                <Brain className="w-4 h-4" />
                <span>Create Plan</span>
              </button>
            )}
          </div>
          
          <ArrowRight className="w-5 h-5 text-nb-black/35 group-hover:text-nb-black group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );

  return viewMode === 'grid' ? <GridCard /> : <ListCard />;
};

export default AICompanyCard;