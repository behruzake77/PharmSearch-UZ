"""
Speech-to-Text moduli — OpenAI Whisper (lokal, "base" versiyasi).

Bu modul boshqa backend logikasidan MUSTAQIL: faqat audio kirish va matn
chiqishi bilan ishlaydi, qidiruv yoki DB haqida hech narsa bilmaydi.
"""

import logging
import tempfile
from pathlib import Path
from typing import BinaryIO

import whisper

logger = logging.getLogger(__name__)

WHISPER_MODEL_NAME = "base"

# Model faqat bir marta, ilova ishga tushganda (birinchi chaqiruvda) yuklanadi
# va xotirada saqlanadi — har safar qayta yuklanmasligi uchun.
_model: whisper.Whisper | None = None


class SpeechToTextError(Exception):
    """Audio matnga aylantirilmasa ko'tariladigan xatolik."""


def _get_model() -> whisper.Whisper:
    global _model
    if _model is None:
        logger.info("Whisper '%s' modeli yuklanmoqda...", WHISPER_MODEL_NAME)
        _model = whisper.load_model(WHISPER_MODEL_NAME)
        logger.info("Whisper modeli yuklandi.")
    return _model


def is_model_loaded() -> bool:
    return _model is not None


def transcribe_audio(audio_file: BinaryIO, filename: str = "audio.webm") -> str:
    """
    Audio faylni (.wav yoki .webm) qabul qilib, xom matnni qaytaradi.

    `audio_file` — file-like ob'ekt (masalan, FastAPI UploadFile.file).
    Whisper fayl yo'lini talab qiladi, shuning uchun vaqtinchalik faylga yozib olinadi.
    """
    if audio_file is None:
        raise SpeechToTextError("Audio fayl yuborilmadi")

    suffix = Path(filename).suffix or ".webm"

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
            data = audio_file.read()
            if not data:
                raise SpeechToTextError("Audio fayl bo'sh")
            tmp.write(data)
            tmp.flush()

            model = _get_model()
            result = model.transcribe(tmp.name, fp16=False)
    except SpeechToTextError:
        raise
    except Exception as exc:  # noqa: BLE001 — foydalanuvchiga tushunarli xabar qaytarish uchun
        logger.exception("Whisper transkripsiya xatoligi")
        raise SpeechToTextError("Ovozni matnga aylantirishda xatolik yuz berdi") from exc

    text = (result.get("text") or "").strip()
    if not text:
        raise SpeechToTextError("Ovoz aniqlanmadi, qayta urinib ko'ring")

    return text
