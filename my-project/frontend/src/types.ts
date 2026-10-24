export interface AudioMetadata {
  sample_rate: number
  sample_rate_str: string
  bit_depth: number
  bit_depth_str: string
  channels: number
  duration_sec: number
  duration_str: string
  snr_db: number
  snr_str: string
  format: string
}

export interface TemporalSegment {
  index: number
  start: number
  end: number
  is_synthetic: boolean
  spoof_score: number
  confidence: number
}

export interface AcousticBiomarkers {
  phase_coherence: string
  pitch_jitter: string
  shimmer_apq: string
  spectral_flux: string
  temporal_continuity: string
}

export interface AnalysisResult {
  verdict: 'Human' | 'AI-Generated' | 'Unknown'
  confidence: number
  confidence_str: string
  human_voice_prob: number
  human_voice_str: string
  ai_generated_prob: number
  ai_generated_str: string
  scam_risk: 'Low' | 'Medium' | 'High' | 'Unknown'
  scam_score: number
  scam_indicators: string[]
  transcript: string
  inference_time_ms: number
  inference_time_str: string
  audio_metadata: AudioMetadata
  acoustic_biomarkers: AcousticBiomarkers
  temporal_segments: TemporalSegment[]
  model_version: string
  model_id: string
  evaluated_resolution_sec: number
  case_id?: string
  source?: string
  timestamp?: string
  active_model?: string
  device?: string
}

export interface ActivityRecord {
  id: string
  time: string
  source: string
  case_id: string
  verdict: 'Human' | 'AI-Generated'
  confidence: string
  human_prob: number
  ai_prob: number
  scam_risk: 'Low' | 'Medium' | 'High'
  duration: string
  sample_rate: string
  bit_depth: string
  snr: string
}

export interface CaseItem {
  id: string
  name: string
  opened_at: string
  status: 'Active' | 'Under Review' | 'Closed'
  streams_count: number
  spoofs_flagged: number
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'danger' | 'success' | 'info' | 'warning'
  read: boolean
}

export interface BenchmarkMetrics {
  phase1_baseline: {
    dataset: string
    clean_eer: number
    min_t_dcf: number
    f1_score: number
    evaluation_clips: number
  }
  phase2_telephony_extension: {
    clean_eer: number
    resampled_8khz_eer: number
    g711_mulaw_eer: number
    amr_nb_noisy_eer: number
    worst_case_multiplier: number
    target_max_multiplier: number
    passed_constraint: boolean
    partial_fakes_benchmark: {
      total_partially_faked_calls: number
      segment_resolution_sec: number
      localization_f1_score: number
      precision: number
      recall: number
    }
    streaming_performance: {
      window_step_ms: number
      avg_latency_ms: number
      p95_latency_ms: number
      p99_latency_ms: number
      target_max_ms: number
      passed_target: boolean
    }
  }
  roc_curve: Array<{ fpr: number; tpr: number }>
}
