"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl font-bold text-green-600">
            提交成功！
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            所有评价数据已成功保存，感谢您的参与！
          </p>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">评价完成率: 100%</div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 pt-4">
            您现在可以安全关闭此页面
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
