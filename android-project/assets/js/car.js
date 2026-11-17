/**
 * LH44 - LOW TO HIGH SPEED
 * Entidade de veículo (jogador e oponentes da IA)
 */

class Car {
  constructor(id, model, isPlayer = false) {
    this.id = id;
    this.model = model;
    this.isPlayer = isPlayer;
    const dIdx = Math.max(0, (id - 1) % F1_DRIVERS.length);
    this.driverName = isPlayer ? 'LEANDRO' : (F1_DRIVERS[dIdx]?.name || 'PILOTO');
    this.driverCode = isPlayer ? 'LEA' : (F1_DRIVERS[dIdx]?.code || 'CPU');
    this.bodyColor = isPlayer ? model.primaryColor : BOT_BODY_COLORS[id % BOT_BODY_COLORS.length];

    this.z = 0;
    this.x = 0;
    this.bumpVelX = 0;
    this.speed = 0;
    this.laps = 0;
    this.totalDistance = 0;
    this.nextLapTarget = 0;
    this.finishTime = 0;
    this.finishRank = 0;
    this.finished = false;
    this.isBraking = false;
    this.steer = 0;
    this.steerAngle = 0;
    this.inSlipstream = false;
    this.collisionCooldown = 0;
    this.sceneryCollisionCooldown = 0;
    this.bumpBoostTimer = 0;
    this.powerBrakeHoldTime = 0;

    this.currentGear = 1;
    this.rpm = 1000;

    this.nitroCharges = 3;
    this.nitroTimer = 0;
    this.nitroDecayTimer = 0;
    this.isNitro = false;

    this.targetX = 0;
    this.launchDelay = 0;
    this.aiSkill = 0.86 + Math.random() * 0.22;
    this.laneChangeTimer = 1.5 + Math.random() * 2.5;
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  getEffectiveMaxSpeed() {
    if (this.effectiveMaxSpeed) return this.effectiveMaxSpeed;
    return (this.model && this.model.maxSpeed) ? this.model.maxSpeed : 220;
  }

  updateTransmission() {
    const normalMax = this.getEffectiveMaxSpeed();
    const speedRatio = Math.max(0, this.speed / normalMax);
    let gInfo = GEAR_RATIOS[0];
    for (let i = GEAR_RATIOS.length - 1; i >= 0; i--) {
      if (speedRatio >= GEAR_RATIOS[i].minRatio) {
        gInfo = GEAR_RATIOS[i];
        break;
      }
    }
    this.currentGear = gInfo.gear;
    const gProgress = (speedRatio - gInfo.minRatio) / Math.max(0.01, gInfo.maxRatio - gInfo.minRatio);
    // Nas descidas e no vácuo (quando ultrapassa o limite de reta), o motor estica além do giro nominal (over-rev até 8800 RPM)!
    const overspeedBonus = Math.max(0, speedRatio - 1.0) * 4500;
    this.rpm = Math.floor(gInfo.minRpm + Math.min(1.0, Math.max(0, gProgress)) * (gInfo.maxRpm - gInfo.minRpm) + overspeedBonus);
  }
}
