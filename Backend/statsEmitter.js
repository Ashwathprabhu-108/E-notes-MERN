// statsEmitter.js — helper that fetches fresh stats and broadcasts to all admin clients
import File from "./models/File.js";
import User from "./models/User.js";
import Report from "./models/Report.js";
import { getIO } from "./socket.js";

export const emitStatsUpdate = async () => {
  try {
    const io = getIO();
    const [totalUsers, totalFiles, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      File.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
    ]);
    const filesWithDownloads = await File.find().select("downloadCount").lean();
    const totalDownloads = filesWithDownloads.reduce((sum, f) => sum + (f.downloadCount || 0), 0);

    io.emit("stats:update", { totalUsers, totalFiles, totalDownloads, totalReports, pendingReports });
  } catch (err) {
    console.error("[Socket] emitStatsUpdate error:", err.message);
  }
};
