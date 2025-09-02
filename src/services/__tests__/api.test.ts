import { lyzrAPI } from '../api';
import { DocumentStatus } from '@/types';

// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');

describe('LyzrAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadIEPDocument', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          success: true,
          fileId: 'test-file-id',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await lyzrAPI.uploadIEPDocument(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockError = {
        response: {
          data: {
            message: 'Upload failed',
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await lyzrAPI.uploadIEPDocument(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('processIEPIntake', () => {
    it('should process IEP intake successfully', async () => {
      const mockResponse = {
        data: {
          studentName: 'John Doe',
          studentId: 'STU001',
          gradeLevel: '8th Grade',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await lyzrAPI.processIEPIntake('test-doc-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('processRubricScoring', () => {
    it('should process rubric scoring successfully', async () => {
      const mockResponse = {
        data: {
          overallScore: 85,
          categoryScores: {
            presentLevels: 90,
            goals: 80,
          },
          complianceLevel: 'Partially Compliant',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await lyzrAPI.processRubricScoring('test-doc-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('getAgentConfig', () => {
    it('should return agent configuration', () => {
      const config = lyzrAPI.getAgentConfig();

      expect(config).toHaveLength(4);
      expect(config[0].name).toBe('IEP Intake Agent');
      expect(config[1].name).toBe('Redaction & QA Agent');
      expect(config[2].name).toBe('Rubric Scoring Agent');
      expect(config[3].name).toBe('Feedback & Routing Agent');
    });
  });

  describe('getMockIEPData', () => {
    it('should return mock IEP data', () => {
      const mockData = lyzrAPI.getMockIEPData();

      expect(mockData.studentName).toBe('John Doe');
      expect(mockData.studentId).toBe('STU001');
      expect(mockData.gradeLevel).toBe('8th Grade');
      expect(mockData.transitionGoals).toHaveLength(3);
      expect(mockData.services).toHaveLength(2);
    });
  });

  describe('getMockScoringData', () => {
    it('should return mock scoring data', () => {
      const mockData = lyzrAPI.getMockScoringData();

      expect(mockData.overallScore).toBe(85);
      expect(mockData.categoryScores.presentLevels).toBe(90);
      expect(mockData.complianceLevel).toBe('Partially Compliant');
      expect(mockData.detailedScores).toHaveLength(6);
    });
  });

  describe('getMockFeedbackData', () => {
    it('should return mock feedback data', () => {
      const mockData = lyzrAPI.getMockFeedbackData();

      expect(mockData.recommendation).toBe('Revise');
      expect(mockData.confidence).toBe(0.85);
      expect(mockData.detailedFeedback).toHaveLength(3);
      expect(mockData.nextSteps).toHaveLength(4);
    });
  });
});

