// Sitter Onboarding Page -- 5-step wizard

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Play, HelpCircle, Clock, Check, X, ChevronRight, Sparkles,
} from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  useSitterOnboarding,
  QUIZ_QUESTIONS,
  type BasicInfoData,
} from '../../hooks/useSitterOnboarding';
import type { OnboardingDocument } from '../../types';
import '../../styles/pages/sitter-onboarding.css';

const STEP_ICONS = [FileText, Upload, Play, HelpCircle, Clock];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

// ----------------------------------------
// Step 1: Basic Info
// ----------------------------------------
function BasicInfoStep({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: BasicInfoData) => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<BasicInfoData>({
    displayName: '',
    languages: [],
    experience: 0,
    specialties: [],
    bio: '',
  });

  const handleSubmit = () => {
    if (!form.displayName.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="onboarding-step">
      <h2>{t('onboarding.basicInfoTitle')}</h2>
      <p className="step-description">{t('onboarding.basicInfoDesc')}</p>
      <div className="onboarding-form">
        <div className="onboarding-field">
          <label>{t('common.name')}</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder={t('onboarding.namePlaceholder')}
          />
        </div>
        <div className="onboarding-field">
          <label>{t('sitter.languages')}</label>
          <input
            type="text"
            value={form.languages.join(', ')}
            onChange={(e) =>
              setForm({ ...form, languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            placeholder={t('onboarding.languagesPlaceholder')}
          />
          <span className="field-hint">{t('common.commaSeparated')}</span>
        </div>
        <div className="onboarding-field-row">
          <div className="onboarding-field">
            <label>{t('onboarding.experience')}</label>
            <input
              type="number"
              min={0}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })}
            />
            <span className="field-hint">{t('onboarding.experienceHint')}</span>
          </div>
          <div className="onboarding-field">
            <label>{t('onboarding.specialties')}</label>
            <input
              type="text"
              value={form.specialties.join(', ')}
              onChange={(e) =>
                setForm({ ...form, specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
              placeholder={t('onboarding.specialtiesPlaceholder')}
            />
            <span className="field-hint">{t('common.commaSeparated')}</span>
          </div>
        </div>
        <div className="onboarding-field">
          <label>{t('onboarding.bio')}</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder={t('onboarding.bioPlaceholder')}
            rows={3}
          />
        </div>
      </div>
      <div className="onboarding-nav">
        <div />
        <Button onClick={handleSubmit} disabled={!form.displayName.trim() || isSubmitting}>
          {t('common.next')} <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------
// Step 2: Document Upload
// ----------------------------------------
const DOC_TYPES: { value: OnboardingDocument['type']; labelKey: string }[] = [
  { value: 'id_card', labelKey: 'onboarding.docTypeId' },
  { value: 'certificate', labelKey: 'onboarding.docTypeCert' },
  { value: 'background_check', labelKey: 'onboarding.docTypeBg' },
  { value: 'other', labelKey: 'onboarding.docTypeOther' },
];

function DocumentUploadStep({
  documents,
  onUpload,
  onRemove,
  onNext,
  onBack,
  isSubmitting,
}: {
  documents: OnboardingDocument[];
  onUpload: (file: File, type: OnboardingDocument['type']) => void;
  onRemove: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [docType, setDocType] = useState<OnboardingDocument['type']>('id_card');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        onUpload(file, docType);
      });
    },
    [onUpload, docType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="onboarding-step">
      <h2>{t('onboarding.documentsTitle')}</h2>
      <p className="step-description">{t('onboarding.documentsDesc')}</p>

      <div className="doc-type-select">
        {DOC_TYPES.map((dt) => (
          <button
            key={dt.value}
            className={`doc-type-btn ${docType === dt.value ? 'active' : ''}`}
            onClick={() => setDocType(dt.value)}
          >
            {t(dt.labelKey)}
          </button>
        ))}
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-zone-icon"><Upload size={32} /></div>
        <p className="upload-zone-text">{t('onboarding.dragDropText')}</p>
        <p className="upload-zone-hint">{t('onboarding.dragDropHint')}</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {documents.length > 0 && (
        <motion.div
          className="uploaded-docs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {documents.map((d, i) => (
            <motion.div
              key={i}
              className="uploaded-doc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="uploaded-doc-info">
                <div className="uploaded-doc-icon">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="uploaded-doc-name">{d.name}</div>
                  <div className="uploaded-doc-type">{t(`onboarding.docType_${d.type}`)}</div>
                </div>
              </div>
              <button className="uploaded-doc-remove" onClick={() => onRemove(i)}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="onboarding-nav">
        <Button variant="secondary" onClick={onBack}>{t('common.back')}</Button>
        <Button onClick={onNext} disabled={documents.length === 0 || isSubmitting}>
          {t('common.next')} <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------
// Step 3: Training Video
// ----------------------------------------
function TrainingVideoStep({
  onComplete,
  onBack,
  isSubmitting,
}: {
  trainingCompleted?: boolean;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [watched, setWatched] = useState(false);

  return (
    <div className="onboarding-step">
      <h2>{t('onboarding.trainingTitle')}</h2>
      <p className="step-description">{t('onboarding.trainingDesc')}</p>

      <div className="training-video-container">
        <div className="training-video-placeholder">
          <div className="training-play-btn">
            <Play size={32} fill="currentColor" />
          </div>
          <p>{t('onboarding.trainingVideoPlaceholder')}</p>
        </div>
      </div>

      <label className="training-checkbox">
        <input
          type="checkbox"
          checked={watched}
          onChange={(e) => setWatched(e.target.checked)}
        />
        <span>{t('onboarding.trainingConfirm')}</span>
      </label>

      <div className="onboarding-nav">
        <Button variant="secondary" onClick={onBack}>{t('common.back')}</Button>
        <Button onClick={onComplete} disabled={!watched || isSubmitting}>
          {t('common.next')} <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------
// Step 4: Quiz
// ----------------------------------------
function QuizStep({
  onSubmit,
  quizScore,
  onBack,
  isSubmitting,
}: {
  onSubmit: (answers: Record<string, number>) => Promise<boolean>;
  quizScore: number | null;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    const result = await onSubmit(answers);
    setSubmitted(true);
    setPassed(result);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setPassed(false);
  };

  if (submitted && quizScore !== null) {
    return (
      <div className="onboarding-step">
        <h2>{t('onboarding.quizTitle')}</h2>
        <motion.div
          className={`quiz-result ${passed ? 'passed' : 'failed'}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`quiz-result-icon ${passed ? 'passed' : 'failed'}`}>
            {passed ? <Check size={32} /> : <X size={32} />}
          </div>
          <div className="quiz-score">{Math.round(quizScore * 100)}%</div>
          <p>{passed ? t('onboarding.quizPassed') : t('onboarding.quizFailed')}</p>
        </motion.div>
        {!passed && (
          <div className="onboarding-nav">
            <Button variant="secondary" onClick={onBack}>{t('common.back')}</Button>
            <Button onClick={handleRetry}>{t('onboarding.retryQuiz')}</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="onboarding-step">
      <h2>{t('onboarding.quizTitle')}</h2>
      <p className="step-description">{t('onboarding.quizDesc')}</p>

      {QUIZ_QUESTIONS.map((q, qi) => (
        <div key={q.id} className="quiz-question">
          <div className="quiz-question-number">{t('onboarding.questionNum', { num: qi + 1, total: QUIZ_QUESTIONS.length })}</div>
          <h3>{t(`onboarding.${q.question}`)}</h3>
          <div className="quiz-options">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={`quiz-option ${answers[q.id] === oi ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                />
                <span className="quiz-option-indicator" />
                <span>{t(`onboarding.${opt}`)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="onboarding-nav">
        <Button variant="secondary" onClick={onBack}>{t('common.back')}</Button>
        <Button onClick={handleSubmit} disabled={!allAnswered || isSubmitting}>
          {t('common.submit')}
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------
// Step 5: Pending Approval
// ----------------------------------------
function PendingApprovalStep() {
  const { t } = useTranslation();

  return (
    <div className="onboarding-step">
      <motion.div
        className="pending-approval"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="pending-approval-icon">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Clock size={40} />
          </motion.div>
        </div>
        <h2>{t('onboarding.pendingTitle')}</h2>
        <p>{t('onboarding.pendingDesc')}</p>
        <div className="pending-checklist">
          <div className="pending-check-item done">
            <Check size={14} strokeWidth={2.5} />
            <span>{t('onboarding.stepBasicInfo')}</span>
          </div>
          <div className="pending-check-item done">
            <Check size={14} strokeWidth={2.5} />
            <span>{t('onboarding.stepDocuments')}</span>
          </div>
          <div className="pending-check-item done">
            <Check size={14} strokeWidth={2.5} />
            <span>{t('onboarding.stepTraining')}</span>
          </div>
          <div className="pending-check-item done">
            <Check size={14} strokeWidth={2.5} />
            <span>{t('onboarding.stepQuiz')}</span>
          </div>
          <div className="pending-check-item current">
            <Sparkles size={14} strokeWidth={2} />
            <span>{t('onboarding.stepApproval')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ----------------------------------------
// Main Onboarding Component
// ----------------------------------------
export default function SitterOnboarding() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [direction, setDirection] = useState(1);

  const {
    currentStep,
    stepIndex,
    documents,
    trainingCompleted,
    quizScore,
    isSubmitting,
    error,
    nextStep,
    prevStep,
    submitBasicInfo,
    uploadDocument,
    removeDocument,
    completeTraining,
    submitQuiz,
  } = useSitterOnboarding(user?.id);

  const STEP_LABELS = [
    t('onboarding.stepBasicInfo'),
    t('onboarding.stepDocuments'),
    t('onboarding.stepTraining'),
    t('onboarding.stepQuiz'),
    t('onboarding.stepApproval'),
  ];

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handleBack = () => {
    setDirection(-1);
    prevStep();
  };

  const handleBasicInfo = (data: BasicInfoData) => {
    setDirection(1);
    submitBasicInfo(data);
  };

  const handleCompleteTraining = () => {
    setDirection(1);
    completeTraining();
  };

  const progressPercent = ((stepIndex + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="sitter-onboarding animate-fade-in">
      {/* Progress Bar */}
      <div className="onboarding-progress">
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="progress-steps">
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={i} style={{ display: 'contents' }}>
                <div
                  className={`progress-step ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}`}
                >
                  <div className="progress-step-dot">
                    {i < stepIndex ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className="progress-step-label">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <div className="onboarding-error">{error}</div>}

      <Card>
        <CardBody>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {currentStep === 'basicInfo' && (
                <BasicInfoStep onSubmit={handleBasicInfo} isSubmitting={isSubmitting} />
              )}
              {currentStep === 'documentUpload' && (
                <DocumentUploadStep
                  documents={documents}
                  onUpload={uploadDocument}
                  onRemove={removeDocument}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
              {currentStep === 'trainingVideo' && (
                <TrainingVideoStep
                  trainingCompleted={trainingCompleted}
                  onComplete={handleCompleteTraining}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
              {currentStep === 'quiz' && (
                <QuizStep
                  onSubmit={submitQuiz}
                  quizScore={quizScore}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
              {currentStep === 'pendingApproval' && <PendingApprovalStep />}
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>
    </div>
  );
}
