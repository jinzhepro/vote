"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PersonnelList({ personnel, onDelete, onRefresh }) {
  const getTypeColor = (type) => {
    const colors = {
      经控贸易: "bg-blue-100 text-blue-800",
      开投贸易: "bg-green-100 text-green-800",
      开投贸易派遣: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (!personnel || personnel.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无人员数据</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">共 {personnel.length} 人</div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          刷新
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.map((person) => (
          <Card key={person.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{person.name}</CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    person.type
                  )}`}
                >
                  {person.type}
                </span>
              </div>
              <CardDescription className="text-sm">
                {person.department}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs text-gray-500">
                <div>ID: {person.id}</div>
                <div>
                  创建时间: {new Date(person.createdAt).toLocaleString("zh-CN")}
                </div>
                {person.updatedAt !== person.createdAt && (
                  <div>
                    更新时间:{" "}
                    {new Date(person.updatedAt).toLocaleString("zh-CN")}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(person.id)}
                  className="w-full"
                >
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
