"""
Speech-to-Text moduli — OpenAI Whisper (lokal, "base" versiyasi).
"""

import logging
import os
import tempfile
import threading
from pathlib import Path
from typing import BinaryIO

import whisper

logger = logging.getLogger(__name__)

WHISPER_MODEL_NAME = "tiny"  # base (139MB) o'rniga tiny (39MB) — 4x tezroq

# Model workspace ichidagi cache papkasida saqlanadi — workflow va shell
# bir xil joyga murojaat qilsin (HOME farq qilgan holatlarda ham ishlaydi).
_WHISPER_CACHE = Path(__file__).resolve().parent.parent.parent / ".cache" / "whisper"

_model: whisper.Whisper | None = None
_model_lock = threading.Lock()


class SpeechToTextError(Exception):
    """Audio matnga aylantirilmasa ko'tariladigan xatolik."""


def _get_model() -> whisper.Whisper:
    """Thread-safe model yuklash."""
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is None:
            _WHISPER_CACHE.mkdir(parents=True, exist_ok=True)
            logger.info(
                "Whisper '%s' modeli yuklanmoqda (cache: %s)...",
                WHISPER_MODEL_NAME,
                _WHISPER_CACHE,
            )
            _model = whisper.load_model(
                WHISPER_MODEL_NAME, download_root=str(_WHISPER_CACHE)
            )
            logger.info("Whisper modeli yuklandi.")
    return _model


def preload_model() -> None:
    """Startup'da chaqiriladi — birinchi so'rovda kechikish bo'lmasin."""
    try:
        _get_model()
    except Exception:
        logger.exception("Whisper modelini oldindan yuklab bo'lmadi")


def is_model_loaded() -> bool:
    return _model is not None


def transcribe_audio(audio_file: BinaryIO, filename: str = "audio.webm") -> str:
    """
    Audio faylni (.wav, .webm, .mp3) qabul qilib, xom matnni qaytaradi.

    delete=False ishlatiladi: Whisper fayl nomini mustaqil ochadi, shuning
    uchun context manager yopilgandan keyin ham fayl diskda bo'lishi kerak.
    """
    if audio_file is None:
        raise SpeechToTextError("Audio fayl yuborilmadi")

    suffix = Path(filename).suffix or ".webm"
    tmp_path: str | None = None

    try:
        data = audio_file.read()
        if not data:
            raise SpeechToTextError("Audio fayl bo'sh")

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_path = tmp.name
            tmp.write(data)

        model = _get_model()
        result = model.transcribe(
            tmp_path,
            fp16=False,
            # language=None — auto-detect. Dori nomlari lotin/ruscha bo'lgani
            # uchun "uz" belgilab qo'ymaslik yaxshiroq.
            condition_on_previous_text=False,  # har bir segment mustaqil — tezroq
            no_speech_threshold=0.5,           # jim audio tezda aniqlansin
            logprob_threshold=-1.5,            # noaniq tokenlar qabul qilinmasin
        )

    except SpeechToTextError:
        raise
    except Exception as exc:
        logger.exception("Whisper transkripsiya xatoligi")
        raise SpeechToTextError("Ovozni matnga aylantirishda xatolik yuz berdi") from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    text = (result.get("text") or "").strip()
    if not text:
        raise SpeechToTextError("Ovoz aniqlanmadi. Dori nomini aniq va baland aytib ko'ring")

    return text
