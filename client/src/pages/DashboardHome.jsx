const DashboardHome = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to AdaptLearn AI</h1>
        <p className="text-sm text-gray-600 mt-1">Your personalized learning dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Start</h3>
          <p className="text-sm text-gray-600">Begin your learning journey with our curated courses.</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recommendations</h3>
          <p className="text-sm text-gray-600">Get personalized course suggestions powered by AI.</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Track Progress</h3>
          <p className="text-sm text-gray-600">Monitor your learning achievements and streaks.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;