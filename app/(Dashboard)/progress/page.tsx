"use client"

import { useState, useEffect } from 'react';
import FBXViewer from '@/components/Solar';

const InstallationProgressPage = () => {
  const [stages] = useState([
    { id: 1, name: 'Initial Consultation', status: 'Completed', date: '2025-02-25', description: 'Discuss project requirements and feasibility.' },
    { id: 2, name: 'Site Assessment', status: 'Completed', date: '2025-03-01', description: 'Evaluate the site for installation suitability.' },
    { id: 3, name: 'Design Approval', status: 'In Progress', date: '2025-03-06', description: 'Finalize system design and get approvals.' },
    { id: 4, name: 'Permitting', status: 'Not Started', date: '2025-03-20', description: 'Obtain necessary permits for installation.' },
    { id: 5, name: 'Installation', status: 'Not Started', date: '2025-03-29', description: 'Install solar panels and battery storage.' },
    { id: 6, name: 'Inspection', status: 'Not Started', date: '2025-04-01', description: 'Inspect the system for compliance and safety.' },
    { id: 7, name: 'System Activation', status: 'Not Started', date: '2025-04-08', description: 'Activate the system and connect to the grid.' },
  ]);

  const [showAnimation, setShowAnimation] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="py-16 bg-green-50 relative overflow-hidden">
      {showAnimation && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
          <div className="text-6xl animate-rise" role="img" aria-label="sun">☀️</div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Installation Progress</h1>
        <p className="text-lg text-gray-600 mb-12 text-center">Track the progress of your green energy installation project.</p>

        <div className="max-w-4xl mx-auto">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={`text-3xl ${
                  stage.status === 'Completed' ? 'text-yellow-500' :
                  stage.status === 'In Progress' ? 'text-yellow-300' :
                  'text-gray-300'}
                `}>☀️</div>
                {index !== stages.length - 1 && <div className="w-1 h-24 bg-gray-300" />}
              </div>

              <div className="ml-6 mb-8 flex-1 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{stage.name}</h3>
                  <p className="text-gray-600">{stage.description}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stage.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      stage.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}`
                    }>
                      {stage.status}
                    </span>
                    <span className="ml-3 text-gray-500">{stage.date}</span>
                  </div>
                </div>
                {stage.name === 'Design Approval' && (
                  <button
                    onClick={handleApproveClick}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    View Design
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Design Approval Needed</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
              <FBXViewer />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes rise { 0% { transform: translateY(100vh); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
          .animate-rise { animation: rise 2s ease-out; }
        `}
      </style>
    </section>
  );
};

export default InstallationProgressPage;