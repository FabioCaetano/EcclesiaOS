import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type BarcodeDetectorShape = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorShape;

export type QrScannerStatus = "idle" | "starting" | "running" | "error";

export interface UseQrScannerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  status: QrScannerStatus;
  message: string;
  decoder: "barcode_detector" | "jsqr" | "";
}

interface UseQrScannerOptions {
  active: boolean;
  onDecode: (rawValue: string) => void | Promise<void>;
  scanIntervalMs?: number;
}

const isSecureContext = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

export const useQrScanner = ({ active, onDecode, scanIntervalMs = 350 }: UseQrScannerOptions): UseQrScannerResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onDecodeRef = useRef(onDecode);
  const [status, setStatus] = useState<QrScannerStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [decoder, setDecoder] = useState<UseQrScannerResult["decoder"]>("");

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    if (!active) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStatus("idle");
      setMessage("");
      setDecoder("");
      return;
    }

    if (!isSecureContext()) {
      setStatus("error");
      setMessage("Camera precisa de HTTPS ou localhost. Acesse o site via HTTPS para usar a leitura.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setMessage("Este navegador nao oferece acesso a camera. Use o campo manual.");
      return;
    }

    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    const useBarcodeDetector = Boolean(BarcodeDetector);
    setDecoder(useBarcodeDetector ? "barcode_detector" : "jsqr");

    let cancelled = false;
    let timer = 0;
    setStatus("starting");
    setMessage("Solicitando acesso a camera...");

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            setStatus("error");
            setMessage("Nao foi possivel iniciar o video da camera.");
            return;
          }
        }

        setStatus("running");
        setMessage("Aponte a camera para o QR Code.");

        const detector = useBarcodeDetector && BarcodeDetector ? new BarcodeDetector({ formats: ["qr_code"] }) : null;

        const scanFrame = async () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            timer = window.setTimeout(scanFrame, scanIntervalMs);
            return;
          }
          if (video.readyState < 2 || video.videoWidth === 0) {
            timer = window.setTimeout(scanFrame, scanIntervalMs);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext("2d");
          if (!context) {
            timer = window.setTimeout(scanFrame, scanIntervalMs);
            return;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          let rawValue = "";
          try {
            if (detector) {
              const codes = await detector.detect(canvas);
              rawValue = codes[0]?.rawValue || "";
            } else {
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
              rawValue = result?.data || "";
            }
          } catch {
            rawValue = "";
          }

          if (rawValue) {
            await onDecodeRef.current(rawValue);
            return;
          }
          timer = window.setTimeout(scanFrame, scanIntervalMs);
        };

        timer = window.setTimeout(scanFrame, scanIntervalMs);
      } catch (error) {
        if (cancelled) return;
        const name = (error as DOMException | undefined)?.name || "";
        const messageMap: Record<string, string> = {
          NotAllowedError: "Permissao da camera foi negada. Libere o acesso nas configuracoes do navegador.",
          NotFoundError: "Nenhuma camera disponivel neste dispositivo.",
          NotReadableError: "A camera esta em uso por outro aplicativo.",
          OverconstrainedError: "Camera nao atende as restricoes solicitadas. Tente novamente.",
          SecurityError: "Acesso a camera bloqueado. Verifique o HTTPS e as permissoes do site."
        };
        setStatus("error");
        setMessage(messageMap[name] || "Nao foi possivel acessar a camera.");
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [active, scanIntervalMs]);

  return { videoRef, canvasRef, status, message, decoder };
};
