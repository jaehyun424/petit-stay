import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, X, Plus, Check, Save } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';
import { sitterProfiles } from '../../../data/v2-demo-sitters';

const DEMO = sitterProfiles['sitter-001'];

const ALL_LANGUAGES = ['English', 'Korean', 'Japanese', 'Chinese'];
const AGE_RANGES = ['0~2', '3~5', '6~8'];
const SERVICES = [
  { key: 'play', en: 'Play & Activities', ko: '놀이 활동' },
  { key: 'meal', en: 'Meal Assistance', ko: '식사 보조' },
  { key: 'sleep', en: 'Sleep Routine', ko: '수면 루틴' },
  { key: 'safety', en: 'Safety Watch', ko: '안전 관찰' },
];

export default function SitterProfileEdit() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [name, setName] = useState(isKo ? DEMO.nameKo : DEMO.name);
  const [ageGroup, setAgeGroup] = useState(DEMO.ageGroup);
  const [bio, setBio] = useState(isKo ? DEMO.shortBioKo : DEMO.shortBio);
  const [languages, setLanguages] = useState<Record<string, string>>(
    Object.fromEntries(DEMO.languageLevels.map((l) => [l.lang, l.level]))
  );
  const [credentials, setCredentials] = useState([
    isKo ? '유아교육학 학사' : 'B.A. Early Childhood Education',
    isKo ? 'CPR/응급처치 자격증' : 'CPR/First Aid Certified',
  ]);
  const [experienceYears, setExperienceYears] = useState(String(DEMO.experienceYears));
  const [ageExperience, setAgeExperience] = useState<string[]>(['3~5', '6~8']);
  const [services, setServices] = useState<string[]>(DEMO.services);
  const [nightAvailable, setNightAvailable] = useState(DEMO.nightAvailable);
  const [saved, setSaved] = useState(false);

  const toggleLang = (lang: string, level: string) => {
    setLanguages((prev) => {
      if (prev[lang] === level) {
        const { [lang]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [lang]: level };
    });
  };

  const toggleAgeExp = (range: string) => {
    setAgeExperience((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleService = (key: string) => {
    setServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const removeCred = (idx: number) => {
    setCredentials((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCred = () => {
    const newCred = prompt(isKo ? '자격증/교육 이력을 입력하세요' : 'Enter credential or education');
    if (newCred?.trim()) setCredentials((prev) => [...prev, newCred.trim()]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SitterV2Layout
      title="Edit Profile"
      titleKo="프로필 편집"
      showBack
      pendingRequests={2}
    >
      {/* Profile photo */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '프로필 사진' : 'Profile Photo'}</h3>
        <div className="st-photo-upload">
          <img src={DEMO.photo} alt={DEMO.name} className="st-photo-preview" />
          <button className="st-photo-btn">{isKo ? '사진 변경' : 'Change Photo'}</button>
        </div>
      </div>

      {/* Video intro placeholder */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '자기소개 영상' : 'Intro Video'}</h3>
        <div className="st-video-placeholder">
          <Video size={32} />
          <p>{isKo ? '30~60초 자기소개 영상을 업로드하세요' : 'Upload a 30-60 second intro video'}</p>
          <button className="st-photo-btn">
            {isKo ? '영상 업로드' : 'Upload Video'}
          </button>
        </div>
      </div>

      {/* Basic info */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '기본 정보' : 'Basic Info'}</h3>
        <div className="st-form-group">
          <label className="st-form-label">{isKo ? '이름' : 'Name'}</label>
          <input
            className="st-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="st-form-group">
          <label className="st-form-label">{isKo ? '나이대' : 'Age Group'}</label>
          <div className="st-check-group">
            {['20s', '30s', '40s'].map((ag) => (
              <label key={ag} className={`st-check-item ${ageGroup === ag ? 'checked' : ''}`}>
                <input type="radio" name="ageGroup" checked={ageGroup === ag} onChange={() => setAgeGroup(ag)} />
                <span className="st-check-dot">{ageGroup === ag && <Check size={10} />}</span>
                {ag}
              </label>
            ))}
          </div>
        </div>
        <div className="st-form-group">
          <label className="st-form-label">{isKo ? '한줄 소개' : 'Short Bio'}</label>
          <textarea
            className="st-form-input st-form-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
          />
          <span className="st-form-hint">{bio.length}/150</span>
        </div>
      </div>

      {/* Languages */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '언어' : 'Languages'}</h3>
        {ALL_LANGUAGES.map((lang) => (
          <div key={lang} className="st-lang-row">
            <span className="st-lang-name">{lang}</span>
            <div className="st-lang-levels">
              {(['L1', 'L2', 'L3'] as const).map((level) => (
                <button
                  key={level}
                  className={`st-lang-level-btn ${languages[lang] === level ? 'active' : ''}`}
                  onClick={() => toggleLang(lang, level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="st-form-hint" style={{ marginTop: '0.5rem' }}>
          L1 = {isKo ? '기초' : 'Basic'}, L2 = {isKo ? '대화 가능' : 'Conversational'}, L3 = {isKo ? '유창' : 'Fluent'}
        </p>
      </div>

      {/* Credentials */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '자격증/교육 이력' : 'Credentials'}</h3>
        <div className="st-cred-list">
          {credentials.map((cred, i) => (
            <div key={i} className="st-cred-item">
              <span className="st-cred-name">{cred}</span>
              <button className="st-cred-remove" onClick={() => removeCred(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="st-add-btn" style={{ marginTop: '0.5rem' }} onClick={addCred}>
          <Plus size={14} /> {isKo ? '추가' : 'Add'}
        </button>
      </div>

      {/* Experience */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '경력' : 'Experience'}</h3>
        <div className="st-form-group">
          <label className="st-form-label">{isKo ? '경력 연수' : 'Years of Experience'}</label>
          <input
            className="st-form-input"
            type="number"
            min="0"
            max="30"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            style={{ maxWidth: '120px' }}
          />
        </div>
        <div className="st-form-group">
          <label className="st-form-label">{isKo ? '연령별 경험' : 'Age Experience'}</label>
          <div className="st-check-group">
            {AGE_RANGES.map((range) => (
              <label key={range} className={`st-check-item ${ageExperience.includes(range) ? 'checked' : ''}`}>
                <input type="checkbox" checked={ageExperience.includes(range)} onChange={() => toggleAgeExp(range)} />
                <span className="st-check-dot">{ageExperience.includes(range) && <Check size={10} />}</span>
                {range}{isKo ? '세' : 'y'}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '서비스 범위' : 'Services'}</h3>
        <div className="st-check-group">
          {SERVICES.map((svc) => (
            <label key={svc.key} className={`st-check-item ${services.includes(svc.key) ? 'checked' : ''}`}>
              <input type="checkbox" checked={services.includes(svc.key)} onChange={() => toggleService(svc.key)} />
              <span className="st-check-dot">{services.includes(svc.key) && <Check size={10} />}</span>
              {isKo ? svc.ko : svc.en}
            </label>
          ))}
        </div>
      </div>

      {/* Night toggle */}
      <div className="st-card">
        <div className="st-toggle-row">
          <span className="st-toggle-label">{isKo ? '야간 가능 (22시 이후)' : 'Night available (after 22:00)'}</span>
          <button
            className={`st-toggle ${nightAvailable ? 'on' : ''}`}
            onClick={() => setNightAvailable(!nightAvailable)}
            aria-label="Toggle night availability"
          />
        </div>
      </div>

      {/* Save */}
      <button className="st-save-btn" onClick={handleSave}>
        <Save size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
        {saved ? (isKo ? '저장 완료!' : 'Saved!') : (isKo ? '프로필 저장' : 'Save Profile')}
      </button>
    </SitterV2Layout>
  );
}
