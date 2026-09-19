"use client";

import { ArrowUp, Microphone, Sparkle, WarningCircle, X } from "@phosphor-icons/react/dist/ssr";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

interface NaturalLanguageInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  initialText?: string;
  onVoiceSubmit?: (audioBase64: string, mimeType: string) => void;
  isTranscribingVoice?: boolean;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix — Gemini's inlineData wants raw base64.
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Minimal shape of the non-standard Web Speech API — not in TS's DOM lib. */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function NaturalLanguageInput({
  onSubmit,
  isSubmitting,
  error,
  initialText,
  onVoiceSubmit,
  isTranscribingVoice,
}: NaturalLanguageInputProps) {
  const { t, locale } = useLocale();
  const [text, setText] = useState(initialText ?? "");
  const [open, setOpen] = useState(Boolean(initialText));
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      typeof window.MediaRecorder !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia);
    // Feature-detecting a browser API (MediaRecorder/getUserMedia) can only
    // happen client-side after mount — same pattern as locale-context.tsx's
    // localStorage read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(supported);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  /**
   * Live on-screen captions while recording, via the browser's own (free,
   * client-side) speech recognition — purely visual feedback so the user can
   * see their words land as they speak. The actual submission still goes
   * through the recorded audio to Gemini (startRecording's MediaRecorder
   * below), which is the accurate, authoritative transcription; if this
   * live-caption API is unsupported or errors, it's silently skipped.
   */
  function startLiveCaptions() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    try {
      const recognition = new Ctor();
      recognition.lang = locale === "az" ? "az-AZ" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };
      recognition.onerror = () => {
        recognitionRef.current = null;
      };
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      recognitionRef.current = null;
    }
  }

  async function startRecording() {
    setVoiceError(null);
    setText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (blob.size === 0) return;
        blobToBase64(blob)
          .then((base64) => onVoiceSubmit?.(base64, type))
          .catch(() => setVoiceError(t.search.nlVoiceError));
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      startLiveCaptions();
      setIsRecording(true);
      setOpen(true);
    } catch {
      // Open the panel so the error banner (only rendered there) is visible
      // even if the mic was pressed while the natural-language input was
      // still collapsed.
      setOpen(true);
      setVoiceError(t.search.nlVoicePermissionDenied);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }

  function handleMicClick() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 py-1.5 pl-2 pr-3.5 text-sm font-medium text-ivory transition-colors hover:border-gold/50 hover:bg-gold/15"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-gold/20 transition-colors group-hover:bg-gold/30">
            <Sparkle className="size-3.5 text-gold-deep" weight="fill" />
          </span>
          {t.search.nlToggle}
        </button>

        {voiceSupported && onVoiceSubmit && (
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={isRecording ? t.search.nlVoiceStopAria : t.search.nlVoiceStartAria}
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
              isRecording
                ? "border-error/40 bg-error/10 text-error"
                : "border-gold/30 bg-gold/10 text-gold-deep hover:border-gold/50 hover:bg-gold/15",
            )}
          >
            {isRecording && (
              <span
                className="absolute inset-0 animate-ping rounded-full border-2 border-error opacity-40"
                aria-hidden
              />
            )}
            <Microphone className="size-4" weight={isRecording ? "fill" : "regular"} />
          </button>
        )}
      </div>
    );
  }

  const canSubmit = !isSubmitting && text.trim().length >= 3;

  function handleSubmit() {
    if (canSubmit) onSubmit(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ivory/50">
          <Sparkle className="size-3.5 text-gold" weight="fill" />
          {t.search.nlLabel}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="flex size-5 items-center justify-center rounded-full text-ivory/50 transition-colors hover:bg-ivory/10 hover:text-ivory"
        >
          <X className="size-3" weight="bold" />
        </button>
      </div>

      <div className="relative rounded-3xl border border-ivory/15 bg-ivory/[0.05] shadow-sm transition-colors focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.search.nlPlaceholder}
          rows={2}
          autoFocus
          className={cn(
            "w-full resize-none rounded-3xl bg-transparent py-3.5 pl-4 text-sm leading-relaxed text-ivory placeholder:text-ivory/30 focus:outline-none",
            voiceSupported && onVoiceSubmit ? "pr-24" : "pr-14",
          )}
        />

        {voiceSupported && onVoiceSubmit && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isTranscribingVoice}
            aria-label={isRecording ? t.search.nlVoiceStopAria : t.search.nlVoiceStartAria}
            className={cn(
              "absolute bottom-2.5 right-14 flex size-9 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              isRecording ? "bg-error text-white" : "bg-ivory/10 text-ivory hover:bg-gold/20",
            )}
          >
            {isRecording && (
              <span
                className="absolute inset-0 animate-ping rounded-full border-2 border-error opacity-40"
                aria-hidden
              />
            )}
            {isRecording ? (
              <span className="flex h-4 items-end gap-0.5" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="listening-bar w-0.5 rounded-full bg-white"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </span>
            ) : (
              <Microphone className="size-4.5" weight="regular" />
            )}
          </button>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          aria-label={t.search.nlFillCta}
          className="absolute bottom-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-gold text-navy-deep transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-ivory/15 disabled:text-ivory/40"
        >
          <ArrowUp className="size-4.5" weight="bold" />
        </button>
      </div>

      {isRecording && (
        <p className="flex items-center gap-2 px-1 text-xs font-medium text-error">
          <span className="flex h-3.5 items-end gap-0.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="listening-bar w-0.5 rounded-full bg-error"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </span>
          {t.search.nlVoiceRecording}
        </p>
      )}
      {isTranscribingVoice && !isRecording && (
        <p className="px-1 text-xs font-medium text-ivory/50">{t.search.nlVoiceProcessing}</p>
      )}

      {(error || voiceError) && (
        <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          <WarningCircle className="mt-0.5 size-3.5 shrink-0" weight="fill" />
          <p>{error ?? voiceError}</p>
        </div>
      )}
    </div>
  );
}
