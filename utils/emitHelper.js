// utils/emitHelper.js

function emitToTeam(io, teamId, eventName, data) {
  io.to(teamId.toString()).emit(eventName, data);
}

module.exports = emitToTeam;
