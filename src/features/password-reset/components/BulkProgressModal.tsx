'use client';

interface Props {
  total: number;
  success: number;
  failed: number;
  onClose: () => void;
}

export default function BulkProgressModal({ total, success, failed, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">처리 완료</h2>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(success / total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            총 {total}건 중 성공 {success}건, 실패 {failed}건
          </p>
        </div>

        {failed > 0 && (
          <p className="text-sm text-red-600">
            {failed}건 실패. Audit Log에서 상세 내용을 확인하세요.
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
