// ============================================
// Petit Stay - Sitter Onboarding Hook
// ============================================

import { useState, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import type { OnboardingStatus, OnboardingStep, OnboardingDocument } from '../types';

// ----------------------------------------
// Quiz Data
// ----------------------------------------
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'quizQ1',
    options: ['quizQ1A', 'quizQ1B', 'quizQ1C', 'quizQ1D'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    question: 'quizQ2',
    options: ['quizQ2A', 'quizQ2B', 'quizQ2C', 'quizQ2D'],
    correctIndex: 0,
  },
  {
    id: 'q3',
    question: 'quizQ3',
    options: ['quizQ3A', 'quizQ3B', 'quizQ3C', 'quizQ3D'],
    correctIndex: 2,
  },
  {
    id: 'q4',
    question: 'quizQ4',
    options: ['quizQ4A', 'quizQ4B', 'quizQ4C', 'quizQ4D'],
    correctIndex: 3,
  },
  {
    id: 'q5',
    question: 'quizQ5',
    options: ['quizQ5A', 'quizQ5B', 'quizQ5C', 'quizQ5D'],
    correctIndex: 1,
  },
];

const QUIZ_PASS_THRESHOLD = 0.8; // 80% to pass

// ----------------------------------------
// Onboarding Steps
// ----------------------------------------
const STEPS: OnboardingStep[] = ['basicInfo', 'documentUpload', 'trainingVideo', 'quiz', 'pendingApproval'];

export interface BasicInfoData {
  displayName: string;
  languages: string[];
  experience: number;
  specialties: string[];
  bio: string;
}

// ----------------------------------------
// Hook
// ----------------------------------------
export function useSitterOnboarding(userId?: string) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basicInfo');
  const [status, setStatus] = useState<OnboardingStatus>('applied');
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }, [currentStep]);

  // Submit basic info
  const submitBasicInfo = useCallback(async (data: BasicInfoData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!DEMO_MODE && userId) {
        const sitterRef = doc(db, 'sitters', userId);
        await setDoc(sitterRef, {
          userId,
          profile: {
            displayName: data.displayName,
            bio: data.bio,
            avatar: '',
            languages: data.languages,
            experience: data.experience,
            specialties: data.specialties,
          },
          onboarding: {
            status: 'applied',
            currentStep: 'documentUpload',
            documents: [],
            trainingCompleted: false,
            appliedAt: serverTimestamp(),
          },
          tier: 'silver',
          status: 'inactive',
          certifications: [],
          verification: { identity: 'pending', background: 'pending', training: 'pending' },
          availability: {
            monday: [], tuesday: [], wednesday: [], thursday: [],
            friday: [], saturday: [], sunday: [],
            nightShift: false, holidayAvailable: false,
          },
          pricing: { hourlyRate: 0, nightMultiplier: 1.5, holidayMultiplier: 1.5 },
          stats: {
            totalSessions: 0, totalHours: 0, averageRating: 0,
            ratingCount: 0, safetyRecord: 0, noShowCount: 0, repeatClientRate: 0,
          },
          bankInfo: { bankName: '', accountNumber: '', accountHolder: '' },
          partnerHotels: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      setStatus('applied');
      nextStep();
    } catch {
      setError('Failed to save basic information');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, nextStep]);

  // Upload document
  const uploadDocument = useCallback(async (file: File, docType: OnboardingDocument['type']) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let url = '';
      if (!DEMO_MODE && userId) {
        const storageRef = ref(storage, `onboarding/${userId}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        url = await getDownloadURL(snapshot.ref);
      } else {
        url = `demo://documents/${file.name}`;
      }

      const newDoc: OnboardingDocument = {
        type: docType,
        name: file.name,
        url,
        uploadedAt: new Date(),
      };

      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);

      if (!DEMO_MODE && userId) {
        await updateDoc(doc(db, 'sitters', userId), {
          'onboarding.documents': updatedDocs,
          'onboarding.status': 'documents_submitted',
          updatedAt: serverTimestamp(),
        });
      }

      setStatus('documents_submitted');
    } catch {
      setError('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, documents]);

  // Remove document
  const removeDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Complete training video
  const completeTraining = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      setTrainingCompleted(true);
      setStatus('training');

      if (!DEMO_MODE && userId) {
        await updateDoc(doc(db, 'sitters', userId), {
          'onboarding.trainingCompleted': true,
          'onboarding.status': 'training',
          'onboarding.currentStep': 'quiz',
          updatedAt: serverTimestamp(),
        });
      }

      nextStep();
    } catch {
      setError('Failed to save training completion');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, nextStep]);

  // Submit quiz answers
  const submitQuiz = useCallback(async (answers: Record<string, number>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let correct = 0;
      QUIZ_QUESTIONS.forEach((q) => {
        if (answers[q.id] === q.correctIndex) correct++;
      });
      const score = correct / QUIZ_QUESTIONS.length;
      setQuizScore(score);

      const passed = score >= QUIZ_PASS_THRESHOLD;

      if (!DEMO_MODE && userId) {
        await updateDoc(doc(db, 'sitters', userId), {
          'onboarding.quizScore': score,
          'onboarding.status': passed ? 'quiz_passed' : 'applied',
          'onboarding.currentStep': passed ? 'pendingApproval' : 'quiz',
          ...(passed ? { 'onboarding.quizPassedAt': serverTimestamp() } : {}),
          updatedAt: serverTimestamp(),
        });
      }

      if (passed) {
        setStatus('quiz_passed');
        nextStep();
      }

      return passed;
    } catch {
      setError('Failed to submit quiz');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, nextStep]);

  return {
    currentStep,
    stepIndex,
    totalSteps,
    status,
    documents,
    trainingCompleted,
    quizScore,
    isSubmitting,
    error,
    goToStep,
    nextStep,
    prevStep,
    submitBasicInfo,
    uploadDocument,
    removeDocument,
    completeTraining,
    submitQuiz,
  };
}
