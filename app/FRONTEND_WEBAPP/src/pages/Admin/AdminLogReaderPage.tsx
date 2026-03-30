import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Button, Input, Textarea } from "../../components/ui";
import { adminLogApi } from "../../services/AdminLogAPI";

export default function AdminLogReaderPage(): React.ReactElement {
  const [path, setPath] = useState("app.log");
  const [resolvedPath, setResolvedPath] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const readLog = async (targetPath: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await adminLogApi.read(targetPath);
      setResolvedPath(data.path);
      setContent(data.content || "");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      setResolvedPath("");
      setContent("");
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          "read failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    readLog("app.log");
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Log Reader</h1>
          <p className="mt-1 text-sm text-gray-500">
            อ่านไฟล์ log สำหรับผู้ดูแลระบบ และสามารถเปลี่ยน path ที่ต้องการอ่านได้
          </p>
        </div>

        <form
          className="mb-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            readLog(path);
          }}
        >
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="app.log หรือ ../../../flag.txt"
          />
          <Button type="submit" loading={loading}>
            Read
          </Button>
        </form>

        {resolvedPath && (
          <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {resolvedPath}
          </div>
        )}

        {error ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <Textarea
          value={content}
          readOnly
          className="h-[520px] font-mono text-xs"
          placeholder="file content"
        />
      </div>
    </div>
  );
}
