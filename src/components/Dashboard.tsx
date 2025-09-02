'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import { DashboardStats, RecentActivity, DocumentStatus } from '@/types';

interface DashboardProps {
  documents: any[];
  onDocumentSelect: (documentId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, onDocumentSelect }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    processedDocuments: 0,
    averageScore: 0,
    complianceRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Calculate stats from documents
    const totalDocs = documents.length;
    const processedDocs = documents.filter(doc => doc.status === DocumentStatus.COMPLETED).length;
    const averageScore = documents
      .filter(doc => doc.scoringData?.overallScore)
      .reduce((sum, doc) => sum + doc.scoringData.overallScore, 0) / 
      documents.filter(doc => doc.scoringData?.overallScore).length || 0;
    const complianceRate = documents
      .filter(doc => doc.scoringData?.complianceLevel === 'Fully Compliant').length / 
      totalDocs * 100 || 0;

    setStats({
      totalDocuments: totalDocs,
      processedDocuments: processedDocs,
      averageScore: Math.round(averageScore),
      complianceRate: Math.round(complianceRate),
    });

    // Generate recent activity
    const activity: RecentActivity[] = documents
      .slice(-5)
      .map(doc => ({
        id: doc.id,
        documentName: doc.fileName,
        action: getActionText(doc.status),
        timestamp: doc.uploadDate,
        status: doc.status,
      }))
      .reverse();

    setRecentActivity(activity);
  }, [documents]);

  const getActionText = (status: DocumentStatus): string => {
    switch (status) {
      case DocumentStatus.UPLOADED:
        return 'Document uploaded';
      case DocumentStatus.PROCESSING:
        return 'Processing in progress';
      case DocumentStatus.COMPLETED:
        return 'Processing completed';
      case DocumentStatus.ERROR:
        return 'Processing failed';
      default:
        return 'Unknown action';
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case DocumentStatus.ERROR:
        return <AlertTriangle className="w-4 h-4 text-error-500" />;
      case DocumentStatus.PROCESSING:
        return <Clock className="w-4 h-4 text-warning-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DocumentStatus): string => {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return 'text-success-600 bg-success-100';
      case DocumentStatus.ERROR:
        return 'text-error-600 bg-error-100';
      case DocumentStatus.PROCESSING:
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.processedDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.complianceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onDocumentSelect(activity.id)}
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium text-gray-900">{activity.documentName}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {activity.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first IEP document to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-medium">View Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-medium">Team Reports</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-medium">Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

