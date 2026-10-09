/**
 * ==============================================================================
 * ADAPTIVE NETWORK ROUTING & FAILURE RECOVERY SIMULATOR
 * Complete C++ OOP Engine Simulation & Interactive Web Visualizer
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. SOUND SYNTHESIS ENGINE (Web Audio API - Zero External Dependencies)
// ------------------------------------------------------------------------------
class SoundEngine {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  playPacketSend() {
    if (!this.enabled) return;
    this.playBeep(587.33, 'triangle', 0.12, 0.08); // D5
    setTimeout(() => this.playBeep(880, 'sine', 0.15, 0.06), 80); // A5
  }

  playPacketDelivered() {
    if (!this.enabled) return;
    this.playBeep(523.25, 'sine', 0.1, 0.07); // C5
    setTimeout(() => this.playBeep(659.25, 'sine', 0.1, 0.07), 90); // E5
    setTimeout(() => this.playBeep(783.99, 'sine', 0.2, 0.09), 180); // G5
  }

  playFailure() {
    if (!this.enabled) return;
    this.playBeep(220, 'sawtooth', 0.15, 0.1); // A3
    setTimeout(() => this.playBeep(164.81, 'sawtooth', 0.25, 0.12), 120); // E3
  }

  playRepair() {
    if (!this.enabled) return;
    this.playBeep(392, 'sine', 0.1, 0.08); // G4
    setTimeout(() => this.playBeep(523.25, 'sine', 0.15, 0.09), 100); // C5
  }

  playKeypress() {
    if (!this.enabled) return;
    this.playBeep(1200 + Math.random() * 400, 'sine', 0.03, 0.015);
  }
}

const sounds = new SoundEngine();

// ------------------------------------------------------------------------------
// 2. C++ OBJECT-ORIENTED ENGINE SIMULATION CLASSES
// ------------------------------------------------------------------------------

/**
 * Custom Exceptions corresponding to NetworkException.h
 */
class NetworkException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkException';
  }
}

class RouterNotFoundException extends NetworkException {
  constructor(message = 'Router does not exist.') {
    super(message);
    this.name = 'RouterNotFoundException';
  }
}

class LinkNotFoundException extends NetworkException {
  constructor(message = 'Link does not exist.') {
    super(message);
    this.name = 'LinkNotFoundException';
  }
}

class DestinationUnreachableException extends NetworkException {
  constructor(message = 'Destination is unreachable.') {
    super(message);
    this.name = 'DestinationUnreachableException';
  }
}

/**
 * Router Class (Corresponds to Router.h / Router.cpp)
 */
class Router {
  constructor(id = 0, name = 'Unknown') {
    this.id = id;
    this.name = name;
    this.active = true;
    this.packetQueue = []; // queue<Packet*>
  }

  getId() { return this.id; }
  getName() { return this.name; }
  isActive() { return this.active; }

  setActive(status) {
    this.active = Boolean(status);
  }

  addPacket(packet) {
    if (!this.active) return false;
    this.packetQueue.push(packet);
    return true;
  }

  removePacket() {
    if (this.packetQueue.length === 0) return null;
    return this.packetQueue.shift();
  }

  getQueueSize() {
    return this.packetQueue.length;
  }

  display() {
    const statusStr = this.active ? 'ACTIVE' : 'FAILED';
    return `Router ID: ${this.id} | Name: ${this.name} | Status: ${statusStr} | Packets in Queue: ${this.getQueueSize()}`;
  }
}

/**
 * Link Class (Corresponds to Link.h / Link.cpp)
 */
class Link {
  constructor(r1 = 0, r2 = 0, cost = 1) {
    this.router1 = r1;
    this.router2 = r2;
    this.cost = cost;
    this.active = true;
  }

  getRouter1() { return this.router1; }
  getRouter2() { return this.router2; }
  getCost() { return this.cost; }
  setCost(newCost) { this.cost = Math.max(1, newCost); }

  isActive() { return this.active; }

  fail() { this.active = false; }
  repair() { this.active = true; }

  display() {
    const statusStr = this.active ? 'ACTIVE' : 'FAILED';
    return `${this.router1} <----> ${this.router2} | Cost: ${this.cost} | Status: ${statusStr}`;
  }
}

/**
 * Packet Class (Corresponds to Packet.h / Packet.cpp)
 */
class Packet {
  constructor(id = 0, source = 0, destination = 0, priority = 1) {
    this.id = id;
    this.source = source;
    this.destination = destination;
    this.priority = priority;
    this.route = [];
    this.timestamp = new Date().toLocaleTimeString();
    this.status = 'pending'; // 'delivered' | 'lost'
  }

  getId() { return this.id; }
  getSource() { return this.source; }
  getDestination() { return this.destination; }
  getPriority() { return this.priority; }

  setRoute(newRoute) {
    this.route = [...newRoute];
  }

  getRoute() {
    return this.route;
  }

  display() {
    let out = `\n========== PACKET ==========\n`;
    out += `Packet ID: ${this.id}\n`;
    out += `Source: ${this.source}\n`;
    out += `Destination: ${this.destination}\n`;
    out += `Priority: ${this.priority}\n`;
    out += `Route: ${this.route.length === 0 ? 'No route' : this.route.join(' ')}\n`;
    return out;
  }
}

/**
 * Network Class (Corresponds to Network.h / Network.cpp)
 */
class Network {
  constructor() {
    this.routers = []; // vector<Router>
    this.links = [];   // vector<Link>
    this.graph = new Map(); // map<int, vector<pair<int, int>>>
  }

  addRouter(id, name) {
    if (this.findRouter(id) !== null) return;
    this.routers.push(new Router(id, name));
    this.graph.set(id, []);
  }

  addLink(router1, router2, cost) {
    this.validateRouter(router1);
    this.validateRouter(router2);

    if (router1 === router2) return;
    if (this.findLink(router1, router2) !== null) return;

    if (cost <= 0) cost = 1;

    this.links.push(new Link(router1, router2, cost));
    this.graph.get(router1).push({ neighbor: router2, cost });
    this.graph.get(router2).push({ neighbor: router1, cost });
  }

  findRouter(id) {
    for (const router of this.routers) {
      if (router.getId() === id) return router;
    }
    return null;
  }

  findLink(router1, router2) {
    for (const link of this.links) {
      if ((link.getRouter1() === router1 && link.getRouter2() === router2) ||
          (link.getRouter1() === router2 && link.getRouter2() === router1)) {
        return link;
      }
    }
    return null;
  }

  validateRouter(id) {
    if (this.findRouter(id) === null) {
      throw new RouterNotFoundException();
    }
  }

  validateLink(router1, router2) {
    this.validateRouter(router1);
    this.validateRouter(router2);

    if (this.findLink(router1, router2) === null) {
      throw new LinkNotFoundException();
    }
  }

  BFS(source, destination) {
    this.validateRouter(source);
    this.validateRouter(destination);

    const sourceRouter = this.findRouter(source);
    const destRouter = this.findRouter(destination);

    if (!sourceRouter.isActive() || !destRouter.isActive()) {
      throw new DestinationUnreachableException();
    }

    const queue = [source];
    const visited = new Map();
    const parent = new Map();

    for (const router of this.routers) {
      visited.set(router.getId(), false);
      parent.set(router.getId(), -1);
    }

    visited.set(source, true);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === destination) break;

      const neighbors = this.graph.get(current) || [];
      for (const edge of neighbors) {
        const nextRouter = edge.neighbor;
        const link = this.findLink(current, nextRouter);
        const router = this.findRouter(nextRouter);

        if (!link || !router || !link.isActive() || !router.isActive()) {
          continue;
        }

        if (!visited.get(nextRouter)) {
          visited.set(nextRouter, true);
          parent.set(nextRouter, current);
          queue.push(nextRouter);
        }
      }
    }

    if (!visited.get(destination)) {
      throw new DestinationUnreachableException();
    }

    const path = [];
    let curr = destination;
    while (curr !== -1) {
      path.push(curr);
      curr = parent.get(curr);
    }
    path.reverse();
    return path;
  }

  DFS(source, destination) {
    this.validateRouter(source);
    this.validateRouter(destination);

    const sourceRouter = this.findRouter(source);
    const destRouter = this.findRouter(destination);

    if (!sourceRouter.isActive() || !destRouter.isActive()) {
      throw new DestinationUnreachableException();
    }

    const stack = [source];
    const visited = new Map();
    const parent = new Map();

    for (const router of this.routers) {
      visited.set(router.getId(), false);
      parent.set(router.getId(), -1);
    }

    visited.set(source, true);

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === destination) break;

      const neighbors = this.graph.get(current) || [];
      // Matching C++ Network.cpp:197-200 (reverse iteration)
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const nextRouter = neighbors[i].neighbor;
        const link = this.findLink(current, nextRouter);
        const router = this.findRouter(nextRouter);

        if (!link || !router || !link.isActive() || !router.isActive()) {
          continue;
        }

        if (!visited.get(nextRouter)) {
          visited.set(nextRouter, true);
          parent.set(nextRouter, current);
          stack.push(nextRouter);
        }
      }
    }

    if (!visited.get(destination)) {
      throw new DestinationUnreachableException();
    }

    const path = [];
    let curr = destination;
    while (curr !== -1) {
      path.push(curr);
      curr = parent.get(curr);
    }
    path.reverse();
    return path;
  }

  Dijkstra(source, destination) {
    this.validateRouter(source);
    this.validateRouter(destination);

    const sourceRouter = this.findRouter(source);
    const destRouter = this.findRouter(destination);

    if (!sourceRouter.isActive() || !destRouter.isActive()) {
      throw new DestinationUnreachableException();
    }

    const INF = Number.MAX_SAFE_INTEGER;
    const distance = new Map();
    const parent = new Map();
    const visited = new Map();

    for (const router of this.routers) {
      const id = router.getId();
      distance.set(id, INF);
      parent.set(id, -1);
      visited.set(id, false);
    }

    distance.set(source, 0);

    for (let count = 0; count < this.routers.length; count++) {
      let current = -1;
      let bestDistance = INF;

      for (const router of this.routers) {
        const id = router.getId();
        if (!visited.get(id) && router.isActive() && distance.get(id) < bestDistance) {
          bestDistance = distance.get(id);
          current = id;
        }
      }

      if (current === -1) break;

      visited.set(current, true);

      const neighbors = this.graph.get(current) || [];
      for (const edge of neighbors) {
        const nextRouter = edge.neighbor;
        const cost = edge.cost;

        const link = this.findLink(current, nextRouter);
        const router = this.findRouter(nextRouter);

        if (!link || !router || !link.isActive() || !router.isActive()) {
          continue;
        }

        if (distance.get(current) !== INF &&
            distance.get(current) + cost < distance.get(nextRouter)) {
          distance.set(nextRouter, distance.get(current) + cost);
          parent.set(nextRouter, current);
        }
      }
    }

    if (distance.get(destination) === INF) {
      throw new DestinationUnreachableException();
    }

    const path = [];
    let curr = destination;
    while (curr !== -1) {
      path.push(curr);
      curr = parent.get(curr);
    }
    path.reverse();
    return path;
  }

  isConnected() {
    let start = -1;
    for (const router of this.routers) {
      if (router.isActive()) {
        start = router.getId();
        break;
      }
    }

    if (start === -1) return false;

    const queue = [start];
    const visited = new Map();

    for (const router of this.routers) {
      visited.set(router.getId(), false);
    }

    visited.set(start, true);

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.graph.get(current) || [];

      for (const edge of neighbors) {
        const nextRouter = edge.neighbor;
        const link = this.findLink(current, nextRouter);
        const router = this.findRouter(nextRouter);

        if (!link || !router || !link.isActive() || !router.isActive()) {
          continue;
        }

        if (!visited.get(nextRouter)) {
          visited.set(nextRouter, true);
          queue.push(nextRouter);
        }
      }
    }

    for (const router of this.routers) {
      if (router.isActive() && !visited.get(router.getId())) {
        return false;
      }
    }

    return true;
  }

  failRouter(id) {
    this.validateRouter(id);
    const router = this.findRouter(id);
    router.setActive(false);
  }

  repairRouter(id) {
    this.validateRouter(id);
    const router = this.findRouter(id);
    router.setActive(true);
  }

  failLink(router1, router2) {
    this.validateLink(router1, router2);
    const link = this.findLink(router1, router2);
    link.fail();
  }

  repairLink(router1, router2) {
    this.validateLink(router1, router2);
    const link = this.findLink(router1, router2);
    link.repair();
  }

  displayNetwork() {
    let out = '\n============================================\n';
    out += '              ROUTERS\n';
    out += '============================================\n';
    for (const router of this.routers) {
      out += router.display() + '\n';
    }

    out += '\n============================================\n';
    out += '               LINKS\n';
    out += '============================================\n';
    for (const link of this.links) {
      out += link.display() + '\n';
    }
    return out;
  }

  calculatePathCost(path) {
    if (!path || path.length < 2) return 0;
    let totalCost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const link = this.findLink(path[i], path[i + 1]);
      if (link) totalCost += link.getCost();
    }
    return totalCost;
  }

  saveNetworkToFile() {
    let out = 'ROUTERS\n';
    out += this.routers.length + '\n';
    for (const router of this.routers) {
      out += `${router.getId()} ${router.getName()} ${router.isActive() ? 1 : 0}\n`;
    }

    out += 'LINKS\n';
    out += this.links.length + '\n';
    for (const link of this.links) {
      out += `${link.getRouter1()} ${link.getRouter2()} ${link.getCost()} ${link.isActive() ? 1 : 0}\n`;
    }
    return out;
  }

  loadNetworkFromFile(content) {
    this.routers = [];
    this.links = [];
    this.graph = new Map();

    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    let index = 0;

    if (lines[index] !== 'ROUTERS') {
      throw new NetworkException('Invalid network file format (Missing ROUTERS header).');
    }
    index++;

    const routerCount = parseInt(lines[index++], 10);
    for (let i = 0; i < routerCount; i++) {
      const parts = lines[index++].split(/\s+/);
      const id = parseInt(parts[0], 10);
      const name = parts[1];
      const active = parts[2] === '1' || parts[2] === 'true';

      this.addRouter(id, name);
      const router = this.findRouter(id);
      if (router) router.setActive(active);
    }

    if (lines[index] !== 'LINKS') {
      throw new NetworkException('Invalid network file format (Missing LINKS header).');
    }
    index++;

    const linkCount = parseInt(lines[index++], 10);
    for (let i = 0; i < linkCount; i++) {
      const parts = lines[index++].split(/\s+/);
      const r1 = parseInt(parts[0], 10);
      const r2 = parseInt(parts[1], 10);
      const cost = parseInt(parts[2], 10);
      const active = parts[3] === '1' || parts[3] === 'true';

      this.addLink(r1, r2, cost);
      const link = this.findLink(r1, r2);
      if (link) {
        if (active) link.repair();
        else link.fail();
      }
    }
  }
}

/**
 * Strategy Pattern Classes (Corresponds to RoutingStrategy.h / RoutingStrategy.cpp)
 */
class BFSStrategy {
  findRoute(network, source, destination) {
    return network.BFS(source, destination);
  }
  getName() { return 'BFS'; }
}

class DijkstraStrategy {
  findRoute(network, source, destination) {
    return network.Dijkstra(source, destination);
  }
  getName() { return 'Dijkstra'; }
}

class AdaptiveStrategy {
  findRoute(network, source, destination) {
    network.validateRouter(source);
    network.validateRouter(destination);

    try {
      return {
        path: network.Dijkstra(source, destination),
        usedFallback: false,
        name: 'Dijkstra (Primary Least-Cost)'
      };
    } catch (e) {
      if (e instanceof DestinationUnreachableException) {
        const bfsPath = network.BFS(source, destination);
        return {
          path: bfsPath,
          usedFallback: true,
          name: 'BFS (Adaptive Fallback)'
        };
      }
      throw e;
    }
  }
  getName() { return 'Adaptive Routing'; }
}

/**
 * Simulation Coordinator Class (Corresponds to Simulation.h / Simulation.cpp)
 */
class Simulation {
  constructor() {
    this.network = new Network();
    this.bfs = new BFSStrategy();
    this.dijkstra = new DijkstraStrategy();
    this.adaptive = new AdaptiveStrategy();

    this.packets = []; // vector<Packet>
    this.totalPackets = 0;
    this.deliveredPackets = 0;
    this.lostPackets = 0;
    this.nextPacketId = 1;
  }

  createNetwork() {
    // 8 Routers
    this.network.addRouter(1, 'R1');
    this.network.addRouter(2, 'R2');
    this.network.addRouter(3, 'R3');
    this.network.addRouter(4, 'R4');
    this.network.addRouter(5, 'R5');
    this.network.addRouter(6, 'R6');
    this.network.addRouter(7, 'R7');
    this.network.addRouter(8, 'R8');

    // 12 Links with exact edge costs from Simulation.cpp
    this.network.addLink(1, 2, 2);
    this.network.addLink(1, 3, 5);
    this.network.addLink(2, 3, 1);
    this.network.addLink(2, 4, 3);
    this.network.addLink(3, 5, 2);
    this.network.addLink(4, 5, 2);
    this.network.addLink(4, 6, 4);
    this.network.addLink(5, 6, 1);
    this.network.addLink(5, 7, 3);
    this.network.addLink(6, 8, 2);
    this.network.addLink(7, 8, 1);
    this.network.addLink(3, 7, 5);
  }

  displayNetwork() {
    return this.network.displayNetwork();
  }

  sendPacket(source, destination, priority) {
    this.network.validateRouter(source);
    this.network.validateRouter(destination);

    if (priority < 1) {
      throw new NetworkException('Priority must be at least 1.');
    }

    this.totalPackets++;
    const packet = new Packet(this.nextPacketId++, source, destination, priority);
    const sourceRouter = this.network.findRouter(source);

    if (!sourceRouter) {
      throw new RouterNotFoundException();
    }

    if (!sourceRouter.addPacket(packet)) {
      this.lostPackets++;
      packet.status = 'lost';
      this.packets.push(packet);
      throw new NetworkException('Source router is inactive.');
    }

    try {
      const adaptiveResult = this.adaptive.findRoute(this.network, source, destination);
      const route = adaptiveResult.path;
      packet.setRoute(route);
      packet.status = 'delivered';

      const processedPacket = sourceRouter.removePacket();
      if (processedPacket !== null) {
        this.deliveredPackets++;
      }

      this.packets.push(packet);

      let out = packet.display();
      out += '\nPacket delivered successfully.\n';
      return { packet, route, output: out, usedFallback: adaptiveResult.usedFallback };
    } catch (e) {
      if (e instanceof DestinationUnreachableException) {
        sourceRouter.removePacket();
        this.lostPackets++;
        packet.status = 'lost';
        this.packets.push(packet);
      }
      throw e;
    }
  }

  failLink(r1, r2) {
    this.network.failLink(r1, r2);
    return `\nLink ${r1} - ${r2} has FAILED.\n`;
  }

  repairLink(r1, r2) {
    this.network.repairLink(r1, r2);
    return `\nLink ${r1} - ${r2} has been REPAIRED.\n`;
  }

  failRouter(r) {
    this.network.failRouter(r);
    return `\nRouter ${r} has FAILED.\n`;
  }

  repairRouter(r) {
    this.network.repairRouter(r);
    return `\nRouter ${r} has been REPAIRED.\n`;
  }

  compareAlgorithms(source, destination) {
    this.network.validateRouter(source);
    this.network.validateRouter(destination);

    const strategies = [this.bfs, this.dijkstra, this.adaptive];
    let out = '\n============================================\n';
    out += '          ROUTING ALGORITHM COMPARISON\n';
    out += '============================================\n';

    const results = {};

    for (let i = 0; i < strategies.length; i++) {
      const strat = strategies[i];
      out += `\nAlgorithm: ${strat.getName()}\n`;

      try {
        let route = strat.findRoute(this.network, source, destination);
        if (route && route.path) route = route.path; // Adaptive wrapper

        out += `Route: ${route.join(' ')}\n`;
        out += `Hop Count: ${route.length - 1}\n`;
        results[strat.getName()] = {
          success: true,
          route,
          hops: route.length - 1,
          cost: this.network.calculatePathCost(route)
        };
      } catch (e) {
        out += `Result: ${e.message}\n`;
        results[strat.getName()] = {
          success: false,
          error: e.message
        };
      }
    }

    // Also include DFS comparison as mentioned in report
    try {
      const dfsRoute = this.network.DFS(source, destination);
      results['DFS'] = {
        success: true,
        route: dfsRoute,
        hops: dfsRoute.length - 1,
        cost: this.network.calculatePathCost(dfsRoute)
      };
    } catch (e) {
      results['DFS'] = { success: false, error: e.message };
    }

    return { output: out, results };
  }

  showStatistics() {
    let out = '\n============================================\n';
    out += '             SIMULATION STATISTICS\n';
    out += '============================================\n';
    out += `Total Packets: ${this.totalPackets}\n`;
    out += `Delivered Packets: ${this.deliveredPackets}\n`;
    out += `Lost Packets: ${this.lostPackets}\n`;

    let deliveryRate = 0;
    let lossRate = 0;

    if (this.totalPackets > 0) {
      deliveryRate = ((this.deliveredPackets / this.totalPackets) * 100.0).toFixed(2);
      lossRate = ((this.lostPackets / this.totalPackets) * 100.0).toFixed(2);
      out += `Delivery Rate: ${deliveryRate}%\n`;
      out += `Loss Rate: ${lossRate}%\n`;
    } else {
      out += 'Delivery Rate: 0%\n';
      out += 'Loss Rate: 0%\n';
    }

    out += `Total Stored Packet Records: ${this.packets.length}\n`;

    return {
      output: out,
      stats: {
        totalPackets: this.totalPackets,
        deliveredPackets: this.deliveredPackets,
        lostPackets: this.lostPackets,
        deliveryRate: parseFloat(deliveryRate),
        lossRate: parseFloat(lossRate),
        totalRecords: this.packets.length
      }
    };
  }

  checkNetwork() {
    let out = '\n============================================\n';
    out += '          NETWORK CONNECTIVITY\n';
    out += '============================================\n';

    const connected = this.network.isConnected();
    if (connected) {
      out += 'Network Status: CONNECTED\n';
    } else {
      out += 'Network Status: DISCONNECTED\n';
    }
    return { connected, output: out };
  }

  saveDetailsToFile(filename = 'network_data.txt') {
    let out = this.network.saveNetworkToFile();
    out += '\nPACKET HISTORY\n';
    out += '==============\n';
    out += `Total Packets: ${this.totalPackets}\n`;
    out += `Delivered Packets: ${this.deliveredPackets}\n`;
    out += `Lost Packets: ${this.lostPackets}\n\n`;
    out += 'PACKETS\n';

    for (const packet of this.packets) {
      out += `Packet ID: ${packet.getId()}\n`;
      out += `Source: ${packet.getSource()}\n`;
      out += `Destination: ${packet.getDestination()}\n`;
      out += `Priority: ${packet.getPriority()}\n`;

      const route = packet.getRoute();
      if (!route || route.length === 0) {
        out += 'Route: No route\n\n';
      } else {
        out += `Route: ${route.join(' ')}\n\n`;
      }
    }

    const consoleMsg = `\nNetwork details saved successfully to ${filename}\n`;
    return { fileContent: out, output: consoleMsg };
  }

  loadNetworkFromFile(content, filename = 'network_data.txt') {
    this.network.loadNetworkFromFile(content);
    return `\nNetwork loaded successfully from ${filename}\n`;
  }
}

// ------------------------------------------------------------------------------
// 3. INTERACTIVE TOPOLOGY GRAPH VISUALIZER
// ------------------------------------------------------------------------------

class NetworkVisualizer {
  constructor(simulation, containerId) {
    this.sim = simulation;
    this.container = document.getElementById(containerId);
    this.svg = document.getElementById('network-svg');
    this.svgLinksGroup = document.getElementById('svg-links-group');
    this.svgRoutesGroup = document.getElementById('svg-routes-group');
    this.svgLabelsGroup = document.getElementById('svg-labels-group');
    this.nodesContainer = document.getElementById('nodes-container');
    this.packetLayer = document.getElementById('packet-animation-layer');

    // Default node coordinate layout normalized from 0 to 1000 x 600
    this.nodePositions = {
      1: { x: 120, y: 300 }, // R1 Ingress
      2: { x: 300, y: 150 }, // R2 Core North
      3: { x: 300, y: 450 }, // R3 Core South
      4: { x: 500, y: 150 }, // R4 Distribution North
      5: { x: 500, y: 320 }, // R5 Central Hub
      6: { x: 700, y: 220 }, // R6 Aggregation North
      7: { x: 700, y: 450 }, // R7 Aggregation South
      8: { x: 880, y: 300 }  // R8 Egress
    };

    this.activeRoute = [];
    this.isDragging = false;
    this.draggedNodeId = null;
    this.dragOffset = { x: 0, y: 0 };
    this.scaleFactor = 1;

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.render());

    // Drag and drop router node listeners
    this.container.addEventListener('mousemove', (e) => this.handleDrag(e));
    this.container.addEventListener('mouseup', () => this.endDrag());
    this.container.addEventListener('mouseleave', () => this.endDrag());

    // Fit view button
    document.getElementById('btn-fit-view')?.addEventListener('click', () => {
      this.resetPositions();
      this.render();
    });
  }

  resetPositions() {
    this.nodePositions = {
      1: { x: 120, y: 300 },
      2: { x: 300, y: 150 },
      3: { x: 300, y: 450 },
      4: { x: 500, y: 150 },
      5: { x: 500, y: 320 },
      6: { x: 700, y: 220 },
      7: { x: 700, y: 450 },
      8: { x: 880, y: 300 }
    };
  }

  getCanvasScale() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 500;
    return {
      scaleX: w / 1000,
      scaleY: h / 600,
      width: w,
      height: h
    };
  }

  startDrag(e, nodeId) {
    this.isDragging = true;
    this.draggedNodeId = nodeId;
    const { scaleX, scaleY } = this.getCanvasScale();
    const rect = this.container.getBoundingClientRect();
    const currentPos = this.nodePositions[nodeId];

    this.dragOffset = {
      x: (e.clientX - rect.left) / scaleX - currentPos.x,
      y: (e.clientY - rect.top) / scaleY - currentPos.y
    };
  }

  handleDrag(e) {
    if (!this.isDragging || !this.draggedNodeId) return;
    const { scaleX, scaleY, width, height } = this.getCanvasScale();
    const rect = this.container.getBoundingClientRect();

    let newX = (e.clientX - rect.left) / scaleX - this.dragOffset.x;
    let newY = (e.clientY - rect.top) / scaleY - this.dragOffset.y;

    // Bounds clipping with safety margin
    newX = Math.max(50, Math.min(950, newX));
    newY = Math.max(50, Math.min(550, newY));

    this.nodePositions[this.draggedNodeId] = { x: newX, y: newY };
    this.render();
  }

  endDrag() {
    this.isDragging = false;
    this.draggedNodeId = null;
  }

  render() {
    const { scaleX, scaleY } = this.getCanvasScale();

    // 1. Render SVG Links
    let linksHtml = '';
    let labelsHtml = '';

    for (const link of this.sim.network.links) {
      const p1 = this.nodePositions[link.getRouter1()];
      const p2 = this.nodePositions[link.getRouter2()];
      if (!p1 || !p2) continue;

      const x1 = p1.x * scaleX;
      const y1 = p1.y * scaleY;
      const x2 = p2.x * scaleX;
      const y2 = p2.y * scaleY;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const activeClass = link.isActive() ? 'active' : 'failed';

      linksHtml += `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              class="svg-link-line ${activeClass}" 
              data-r1="${link.getRouter1()}" data-r2="${link.getRouter2()}" />
      `;

      labelsHtml += `
        <g class="svg-link-label-group" data-r1="${link.getRouter1()}" data-r2="${link.getRouter2()}" style="cursor:pointer;">
          <rect x="${midX - 18}" y="${midY - 11}" width="36" height="22" 
                class="svg-link-cost-bg ${link.isActive() ? '' : 'failed'}" />
          <text x="${midX}" y="${midY}" class="svg-link-cost-text ${link.isActive() ? 'active' : 'failed'}">
            ${link.isActive() ? 'c:' + link.getCost() : '✕ FAIL'}
          </text>
        </g>
      `;
    }

    this.svgLinksGroup.innerHTML = linksHtml;
    this.svgLabelsGroup.innerHTML = labelsHtml;

    // 2. Render Active Highlight Route (if any)
    let routeHtml = '';
    if (this.activeRoute && this.activeRoute.length >= 2) {
      let d = '';
      for (let i = 0; i < this.activeRoute.length; i++) {
        const id = this.activeRoute[i];
        const pt = this.nodePositions[id];
        if (!pt) continue;
        const x = pt.x * scaleX;
        const y = pt.y * scaleY;
        if (i === 0) d += `M ${x} ${y}`;
        else d += ` L ${x} ${y}`;
      }
      routeHtml = `<path d="${d}" class="svg-route-path" />`;
    }
    this.svgRoutesGroup.innerHTML = routeHtml;

    // 3. Render Interactive Router HTML Nodes
    let nodesHtml = '';
    for (const router of this.sim.network.routers) {
      const id = router.getId();
      const pos = this.nodePositions[id];
      if (!pos) continue;

      const x = pos.x * scaleX;
      const y = pos.y * scaleY;
      const isFailed = !router.isActive();
      const isRouteNode = this.activeRoute.includes(id);

      nodesHtml += `
        <div class="router-node ${isFailed ? 'failed' : ''} ${isRouteNode ? 'highlight-route' : ''}" 
             id="router-node-${id}" 
             data-id="${id}"
             style="left: ${x}px; top: ${y}px;">
          <div class="router-node-circle">
            <span class="router-node-label">R${id}</span>
            ${router.getQueueSize() > 0 ? `<span class="router-queue-badge">${router.getQueueSize()}</span>` : ''}
          </div>
          <span class="router-node-status-badge">
            ${router.isActive() ? 'ACTIVE' : 'FAILED'}
          </span>
        </div>
      `;
    }
    this.nodesContainer.innerHTML = nodesHtml;

    // Reattach node interactions
    this.attachNodeEvents();
    this.attachLinkEvents();
  }

  attachNodeEvents() {
    const nodes = this.nodesContainer.querySelectorAll('.router-node');
    nodes.forEach(nodeEl => {
      const id = parseInt(nodeEl.dataset.id, 10);

      // Drag mousedown
      nodeEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        this.startDrag(e, id);
      });

      // Click to open quick action popover
      nodeEl.addEventListener('click', (e) => {
        if (this.isDragging) return;
        this.showNodePopover(e, id);
      });
    });
  }

  attachLinkEvents() {
    // Click on link line or cost badge to toggle fail/repair
    const labelGroups = this.svgLabelsGroup.querySelectorAll('.svg-link-label-group');
    labelGroups.forEach(el => {
      el.addEventListener('click', () => {
        const r1 = parseInt(el.dataset.r1, 10);
        const r2 = parseInt(el.dataset.r2, 10);
        window.app.toggleLinkState(r1, r2);
      });
    });

    const lines = this.svgLinksGroup.querySelectorAll('.svg-link-line');
    lines.forEach(el => {
      el.addEventListener('click', () => {
        const r1 = parseInt(el.dataset.r1, 10);
        const r2 = parseInt(el.dataset.r2, 10);
        window.app.toggleLinkState(r1, r2);
      });
    });
  }

  showNodePopover(e, id) {
    const popover = document.getElementById('node-popover');
    if (!popover) return;

    const router = this.sim.network.findRouter(id);
    if (!router) return;

    const nameEl = document.getElementById('pop-router-name');
    const statusEl = document.getElementById('pop-router-status');
    const queueEl = document.getElementById('pop-router-queue');
    const toggleBtn = document.getElementById('pop-btn-toggle');
    const srcBtn = document.getElementById('pop-btn-src');
    const dstBtn = document.getElementById('pop-btn-dst');

    nameEl.textContent = `Router R${id} (${router.getName()})`;
    if (router.isActive()) {
      statusEl.textContent = 'ACTIVE';
      statusEl.className = 'text-green';
      toggleBtn.textContent = 'Fail Router';
      toggleBtn.className = 'pop-action-btn danger';
    } else {
      statusEl.textContent = 'FAILED';
      statusEl.className = 'text-danger';
      toggleBtn.textContent = 'Repair Router';
      toggleBtn.className = 'pop-action-btn primary';
    }

    queueEl.textContent = `${router.getQueueSize()} packets`;

    toggleBtn.onclick = () => {
      window.app.toggleRouterState(id);
      popover.classList.add('hidden');
    };

    srcBtn.onclick = () => {
      const srcSelect = document.getElementById('quick-src');
      if (srcSelect) srcSelect.value = String(id);
      popover.classList.add('hidden');
    };

    dstBtn.onclick = () => {
      const dstSelect = document.getElementById('quick-dst');
      if (dstSelect) dstSelect.value = String(id);
      popover.classList.add('hidden');
    };

    // Position popover relative to container
    const rect = this.container.getBoundingClientRect();
    let left = e.clientX - rect.left + 15;
    let top = e.clientY - rect.top + 15;

    if (left + 220 > rect.width) left = rect.width - 230;
    if (top + 180 > rect.height) top = rect.height - 190;

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.classList.remove('hidden');
  }

  setRoute(routePath) {
    this.activeRoute = routePath ? [...routePath] : [];
    this.render();

    // Update bottom status bar
    const routeDisplay = document.getElementById('current-route-display');
    const costDisplay = document.getElementById('current-cost-display');
    const hopsDisplay = document.getElementById('current-hops-display');

    if (this.activeRoute.length > 0) {
      if (routeDisplay) routeDisplay.textContent = this.activeRoute.map(n => `R${n}`).join(' ➔ ');
      if (hopsDisplay) hopsDisplay.textContent = String(this.activeRoute.length - 1);
      const totalCost = this.sim.network.calculatePathCost(this.activeRoute);
      if (costDisplay) costDisplay.textContent = String(totalCost);
    } else {
      if (routeDisplay) routeDisplay.textContent = 'None';
      if (costDisplay) costDisplay.textContent = '0';
      if (hopsDisplay) hopsDisplay.textContent = '0';
    }
  }

  animatePacketTransmission(route, onComplete) {
    if (!route || route.length < 2) {
      if (onComplete) onComplete();
      return;
    }

    const { scaleX, scaleY } = this.getCanvasScale();
    const orb = document.createElement('div');
    orb.className = 'packet-orb';
    this.packetLayer.appendChild(orb);

    let hopIndex = 0;
    const totalHops = route.length - 1;
    const hopDuration = 600; // ms per hop

    const animateHop = () => {
      if (hopIndex >= totalHops) {
        orb.remove();
        sounds.playPacketDelivered();
        if (onComplete) onComplete();
        return;
      }

      const fromNodeId = route[hopIndex];
      const toNodeId = route[hopIndex + 1];

      // Check if link or router failed mid-flight!
      const link = this.sim.network.findLink(fromNodeId, toNodeId);
      const toRouter = this.sim.network.findRouter(toNodeId);

      if (!link || !link.isActive() || !toRouter || !toRouter.isActive()) {
        // Drop packet midway!
        orb.style.background = '#ef4444';
        orb.style.boxShadow = '0 0 25px #ef4444';
        sounds.playFailure();
        this.showGraphAlert(`Packet dropped at R${fromNodeId} ➔ R${toNodeId} due to link/router failure!`);
        setTimeout(() => {
          orb.remove();
          if (onComplete) onComplete();
        }, 500);
        return;
      }

      const p1 = this.nodePositions[fromNodeId];
      const p2 = this.nodePositions[toNodeId];

      const startX = p1.x * scaleX;
      const startY = p1.y * scaleY;
      const targetX = p2.x * scaleX;
      const targetY = p2.y * scaleY;

      orb.style.left = `${startX}px`;
      orb.style.top = `${startY}px`;

      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / hopDuration, 1);

        // Smooth cubic ease-in-out
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const curX = startX + (targetX - startX) * ease;
        const curY = startY + (targetY - startY) * ease;

        orb.style.left = `${curX}px`;
        orb.style.top = `${curY}px`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          hopIndex++;
          sounds.playBeep(400 + hopIndex * 80, 'sine', 0.05, 0.03);
          animateHop();
        }
      };

      requestAnimationFrame(step);
    };

    sounds.playPacketSend();
    animateHop();
  }

  showGraphAlert(message) {
    const banner = document.getElementById('graph-banner-alert');
    const textEl = document.getElementById('graph-banner-text');
    if (!banner || !textEl) return;

    textEl.textContent = message;
    banner.classList.remove('hidden');

    setTimeout(() => {
      banner.classList.add('hidden');
    }, 4000);
  }
}

// ------------------------------------------------------------------------------
// 4. MAIN APP CONTROLLER & TERMINAL SIMULATOR
// ------------------------------------------------------------------------------

class ApplicationController {
  constructor() {
    this.simulation = new Simulation();
    this.simulation.createNetwork();

    this.visualizer = new NetworkVisualizer(this.simulation, 'graph-wrapper');
    this.terminalOutput = document.getElementById('terminal-output');
    this.terminalInput = document.getElementById('terminal-cli-input');
    this.cmdHistory = [];
    this.historyIdx = -1;

    this.currentPendingAction = null;

    this.initUI();
    this.printWelcomeBanner();
    this.updateHUD();
    this.visualizer.render();
  }

  initUI() {
    // 1. Navigation Tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabId = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        const activeContent = document.getElementById(tabId);
        if (activeContent) activeContent.classList.add('active');

        if (tabId === 'tab-simulator') {
          setTimeout(() => this.visualizer.render(), 100);
        } else if (tabId === 'tab-history') {
          this.refreshPacketHistoryView();
        }
      });
    });

    // 2. Menu Buttons (Options 1 - 11 & 0)
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = parseInt(btn.dataset.choice, 10);
        this.executeMenuChoice(choice);
      });
    });

    // 3. Terminal CLI Input submission
    this.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.terminalInput.value.trim();
        this.terminalInput.value = '';
        if (cmd) {
          this.cmdHistory.push(cmd);
          this.historyIdx = this.cmdHistory.length;
          this.handleTerminalCommand(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.terminalInput.value = this.cmdHistory[this.historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIdx < this.cmdHistory.length - 1) {
          this.historyIdx++;
          this.terminalInput.value = this.cmdHistory[this.historyIdx] || '';
        } else {
          this.historyIdx = this.cmdHistory.length;
          this.terminalInput.value = '';
        }
      } else {
        sounds.playKeypress();
      }
    });

    document.getElementById('terminal-submit-btn')?.addEventListener('click', () => {
      const cmd = this.terminalInput.value.trim();
      this.terminalInput.value = '';
      if (cmd) this.handleTerminalCommand(cmd);
    });

    // Terminal clear and copy
    document.getElementById('btn-clear-terminal')?.addEventListener('click', () => {
      this.terminalOutput.textContent = '';
      this.printWelcomeBanner();
    });

    document.getElementById('btn-copy-terminal')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.terminalOutput.textContent);
      this.showToast('Terminal output copied to clipboard!');
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn?.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      if (soundIcon) {
        soundIcon.setAttribute('data-lucide', sounds.enabled ? 'volume-2' : 'volume-x');
        lucide.createIcons();
      }
      this.showToast(sounds.enabled ? 'Sound FX Enabled' : 'Sound FX Muted');
    });

    // Reset Network
    document.getElementById('btn-reset-network')?.addEventListener('click', () => {
      this.resetNetworkState();
    });

    // Quick Send Packet Deck
    document.getElementById('quick-send-btn')?.addEventListener('click', () => {
      const src = parseInt(document.getElementById('quick-src').value, 10);
      const dst = parseInt(document.getElementById('quick-dst').value, 10);
      const pri = parseInt(document.getElementById('quick-priority').value, 10) || 1;
      this.performSendPacket(src, dst, pri);
    });

    document.getElementById('btn-quick-packet')?.addEventListener('click', () => {
      this.openModal('modal-send-packet');
    });

    // Preset Scenarios
    document.getElementById('scenario-fail-r5')?.addEventListener('click', () => {
      this.toggleRouterState(5, false);
      this.showToast('Core Router R5 disabled! Dynamic routing will adapt bypass.');
    });

    document.getElementById('scenario-fail-link-2-3')?.addEventListener('click', () => {
      this.toggleLinkState(2, 3, false);
      this.showToast('Link R2 - R3 severed! Traffic rerouting applied.');
    });

    document.getElementById('scenario-fail-bottleneck')?.addEventListener('click', () => {
      this.simulation.failLink(6, 8);
      this.simulation.failLink(7, 8);
      this.logToTerminal(`\n[SCENARIO] Severed Links 6-8 and 7-8 to test destination partition.`);
      sounds.playFailure();
      this.updateAfterTopologyChange();
    });

    document.getElementById('scenario-repair-all')?.addEventListener('click', () => {
      this.healFullNetwork();
    });

    // Algorithm Comparison Tab Actions
    document.getElementById('btn-run-algo-comparison')?.addEventListener('click', () => {
      const src = parseInt(document.getElementById('algo-src').value, 10);
      const dst = parseInt(document.getElementById('algo-dst').value, 10);
      this.runAlgorithmComparisonUI(src, dst);
    });

    // Preview Route on topology from comparison cards
    document.querySelectorAll('.preview-route-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const algo = btn.dataset.algo;
        const src = parseInt(document.getElementById('algo-src').value, 10);
        const dst = parseInt(document.getElementById('algo-dst').value, 10);

        try {
          let route = [];
          if (algo === 'bfs') route = this.simulation.bfs.findRoute(this.simulation.network, src, dst);
          else if (algo === 'dijkstra') route = this.simulation.dijkstra.findRoute(this.simulation.network, src, dst);
          else if (algo === 'adaptive') {
            const res = this.simulation.adaptive.findRoute(this.simulation.network, src, dst);
            route = res.path;
          } else if (algo === 'dfs') route = this.simulation.network.DFS(src, dst);

          // Switch to Simulator Tab and highlight route
          document.querySelector('[data-tab="tab-simulator"]').click();
          this.visualizer.setRoute(route);
          this.visualizer.animatePacketTransmission(route);
          this.showToast(`Previewing ${algo.toUpperCase()} route: ${route.join(' ➔ ')}`);
        } catch (e) {
          this.showToast(`Route preview failed: ${e.message}`, true);
        }
      });
    });

    // File Download and Copy in Save Modal
    document.getElementById('btn-download-file')?.addEventListener('click', () => {
      const { fileContent } = this.simulation.saveDetailsToFile('network_data.txt');
      this.downloadTextFile('network_data.txt', fileContent);
    });

    document.getElementById('btn-copy-file-content')?.addEventListener('click', () => {
      const preEl = document.getElementById('save-file-preview');
      if (preEl) {
        navigator.clipboard.writeText(preEl.textContent);
        this.showToast('Copied network_data.txt content!');
      }
    });

    // File Upload in Load Modal
    const fileInput = document.getElementById('file-input-el');
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('load-file-textarea').value = event.target.result;
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btn-submit-load-file')?.addEventListener('click', () => {
      const content = document.getElementById('load-file-textarea').value;
      if (!content.trim()) {
        alert('Please enter or upload network_data.txt content.');
        return;
      }
      try {
        const msg = this.simulation.loadNetworkFromFile(content, 'network_data.txt');
        this.logToTerminal(msg);
        this.closeAllModals();
        this.updateAfterTopologyChange();
        sounds.playRepair();
        this.showToast('Network topology restored successfully from file!');
      } catch (e) {
        alert(`Error loading file: ${e.message}`);
      }
    });

    // Node Popover close button
    document.getElementById('pop-close-btn')?.addEventListener('click', () => {
      document.getElementById('node-popover')?.classList.add('hidden');
    });

    // Modals setup
    this.setupModals();

    // Lucide Icons init
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  setupModals() {
    // Close button for all modals
    document.querySelectorAll('.modal-close-btn, .modal-btn-cancel').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Modal: Send Packet Submit
    document.getElementById('btn-modal-submit-packet')?.addEventListener('click', () => {
      const src = parseInt(document.getElementById('modal-pkt-source').value, 10);
      const dst = parseInt(document.getElementById('modal-pkt-dest').value, 10);
      const pri = parseInt(document.getElementById('modal-pkt-priority').value, 10) || 1;
      this.closeAllModals();
      this.performSendPacket(src, dst, pri);
    });

    // Modal: Compare Submit
    document.getElementById('btn-modal-submit-compare')?.addEventListener('click', () => {
      const src = parseInt(document.getElementById('modal-comp-source').value, 10);
      const dst = parseInt(document.getElementById('modal-comp-dest').value, 10);
      this.closeAllModals();
      this.executeCompare(src, dst);
    });

    // Modal: Fail Link Submit
    document.getElementById('btn-modal-submit-fail-link')?.addEventListener('click', () => {
      const r1 = parseInt(document.getElementById('modal-fl-r1').value, 10);
      const r2 = parseInt(document.getElementById('modal-fl-r2').value, 10);
      this.closeAllModals();
      this.toggleLinkState(r1, r2, false);
    });

    // Modal: Repair Link Submit
    document.getElementById('btn-modal-submit-repair-link')?.addEventListener('click', () => {
      const val = document.getElementById('modal-rl-select').value;
      if (!val) return;
      const [r1, r2] = val.split('-').map(Number);
      this.closeAllModals();
      this.toggleLinkState(r1, r2, true);
    });

    // Modal: Fail Router Submit
    document.getElementById('btn-modal-submit-fail-router')?.addEventListener('click', () => {
      const id = parseInt(document.getElementById('modal-fr-select').value, 10);
      this.closeAllModals();
      this.toggleRouterState(id, false);
    });

    // Modal: Repair Router Submit
    document.getElementById('btn-modal-submit-repair-router')?.addEventListener('click', () => {
      const id = parseInt(document.getElementById('modal-rr-select').value, 10);
      this.closeAllModals();
      this.toggleRouterState(id, true);
    });
  }

  openModal(modalId) {
    this.populateModalDropdowns();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }

  populateModalDropdowns() {
    // Populate Links for Fail Link modal
    const flR1 = document.getElementById('modal-fl-r1');
    const flR2 = document.getElementById('modal-fl-r2');
    if (flR1 && flR2) {
      flR1.innerHTML = '';
      flR2.innerHTML = '';
      for (const r of this.simulation.network.routers) {
        flR1.innerHTML += `<option value="${r.getId()}">${r.getId()} (${r.getName()})</option>`;
        flR2.innerHTML += `<option value="${r.getId()}">${r.getId()} (${r.getName()})</option>`;
      }
      flR2.value = '2';
    }

    // Populate Failed Links for Repair Link modal
    const rlSelect = document.getElementById('modal-rl-select');
    if (rlSelect) {
      rlSelect.innerHTML = '';
      const failedLinks = this.simulation.network.links.filter(l => !l.isActive());
      if (failedLinks.length === 0) {
        rlSelect.innerHTML = '<option value="">No failed links currently</option>';
      } else {
        failedLinks.forEach(l => {
          rlSelect.innerHTML += `<option value="${l.getRouter1()}-${l.getRouter2()}">Link ${l.getRouter1()} <--> ${l.getRouter2()} (Cost: ${l.getCost()})</option>`;
        });
      }
    }

    // Populate Active Routers for Fail Router modal
    const frSelect = document.getElementById('modal-fr-select');
    if (frSelect) {
      frSelect.innerHTML = '';
      const activeRouters = this.simulation.network.routers.filter(r => r.isActive());
      activeRouters.forEach(r => {
        frSelect.innerHTML += `<option value="${r.getId()}">Router ${r.getId()} (${r.getName()})</option>`;
      });
    }

    // Populate Failed Routers for Repair Router modal
    const rrSelect = document.getElementById('modal-rr-select');
    if (rrSelect) {
      rrSelect.innerHTML = '';
      const failedRouters = this.simulation.network.routers.filter(r => !r.isActive());
      if (failedRouters.length === 0) {
        rrSelect.innerHTML = '<option value="">No failed routers currently</option>';
      } else {
        failedRouters.forEach(r => {
          rrSelect.innerHTML += `<option value="${r.getId()}">Router ${r.getId()} (${r.getName()})</option>`;
        });
      }
    }
  }

  printWelcomeBanner() {
    let out = '============================================\n';
    out += '       ADAPTIVE NETWORK ROUTING SIMULATOR\n';
    out += '============================================\n';
    out += '1.  Display Network\n';
    out += '2.  Send Packet\n';
    out += '3.  Compare Routing Algorithms\n';
    out += '4.  Fail Link\n';
    out += '5.  Repair Link\n';
    out += '6.  Fail Router\n';
    out += '7.  Repair Router\n';
    out += '8.  Check Network Connectivity\n';
    out += '9.  Show Statistics\n';
    out += '10. Save Details to File\n';
    out += '11. Load Network from File\n';
    out += '0.  Exit\n';
    out += '============================================\n';
    out += 'Enter your choice: ';
    this.logToTerminal(out);
  }

  logToTerminal(text) {
    this.terminalOutput.textContent += text;
    const screen = document.getElementById('terminal-screen');
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  showToast(msg, isError = false) {
    this.visualizer.showGraphAlert(msg);
  }

  downloadTextFile(filename, text) {
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute('download', filename);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  // ----------------------------------------------------------------------------
  // Menu Execution Dispatcher (Options 1 - 11 & 0)
  // ----------------------------------------------------------------------------
  executeMenuChoice(choice) {
    this.logToTerminal(`${choice}\n`);

    switch (choice) {
      case 1: // Display Network
        this.logToTerminal(this.simulation.displayNetwork());
        this.printPrompt();
        break;

      case 2: // Send Packet
        this.openModal('modal-send-packet');
        break;

      case 3: // Compare Algorithms
        this.openModal('modal-compare-algo');
        break;

      case 4: // Fail Link
        this.openModal('modal-fail-link');
        break;

      case 5: // Repair Link
        this.openModal('modal-repair-link');
        break;

      case 6: // Fail Router
        this.openModal('modal-fail-router');
        break;

      case 7: // Repair Router
        this.openModal('modal-repair-router');
        break;

      case 8: // Check Connectivity
        const conn = this.simulation.checkNetwork();
        this.logToTerminal(conn.output);
        this.printPrompt();
        break;

      case 9: // Show Statistics
        const stats = this.simulation.showStatistics();
        this.logToTerminal(stats.output);
        this.printPrompt();
        break;

      case 10: // Save Details to File
        const fileData = this.simulation.saveDetailsToFile('network_data.txt');
        this.logToTerminal(fileData.output);
        document.getElementById('save-file-preview').textContent = fileData.fileContent;
        this.openModal('modal-save-file');
        this.printPrompt();
        break;

      case 11: // Load Network from File
        this.openModal('modal-load-file');
        break;

      case 0: // Exit / Reset
        this.logToTerminal('\nThank you for using Adaptive Network Routing Simulator!\n');
        this.showToast('Simulator session reset.');
        this.resetNetworkState();
        break;

      default:
        this.logToTerminal('\nInvalid choice. Please try again.\n');
        this.printPrompt();
        break;
    }
  }

  handleTerminalCommand(cmd) {
    const trimmed = cmd.trim();
    const choiceNum = parseInt(trimmed, 10);

    if (!isNaN(choiceNum) && choiceNum >= 0 && choiceNum <= 11) {
      this.executeMenuChoice(choiceNum);
      return;
    }

    // Extended CLI commands: "send 1 8 2", "fail link 2 3", "fail router 5", etc.
    const parts = trimmed.split(/\s+/);
    const verb = parts[0].toLowerCase();

    if (verb === 'send' && parts.length >= 3) {
      const src = parseInt(parts[1], 10);
      const dst = parseInt(parts[2], 10);
      const pri = parseInt(parts[3], 10) || 1;
      this.performSendPacket(src, dst, pri);
    } else if (verb === 'compare' && parts.length >= 3) {
      const src = parseInt(parts[1], 10);
      const dst = parseInt(parts[2], 10);
      this.executeCompare(src, dst);
    } else if (verb === 'fail' && parts[1] === 'link' && parts.length >= 4) {
      this.toggleLinkState(parseInt(parts[2], 10), parseInt(parts[3], 10), false);
    } else if (verb === 'repair' && parts[1] === 'link' && parts.length >= 4) {
      this.toggleLinkState(parseInt(parts[2], 10), parseInt(parts[3], 10), true);
    } else if (verb === 'fail' && parts[1] === 'router' && parts.length >= 3) {
      this.toggleRouterState(parseInt(parts[2], 10), false);
    } else if (verb === 'repair' && parts[1] === 'router' && parts.length >= 3) {
      this.toggleRouterState(parseInt(parts[2], 10), true);
    } else if (verb === 'clear') {
      this.terminalOutput.textContent = '';
      this.printWelcomeBanner();
    } else if (verb === 'help') {
      this.logToTerminal('\nType 1-11 for menu choices, or commands:\n  send <src> <dst> <pri>\n  fail router <id>\n  repair router <id>\n  fail link <r1> <r2>\n  repair link <r1> <r2>\n  clear\n');
      this.printPrompt();
    } else {
      this.logToTerminal(`\nInvalid choice. Please try again.\n`);
      this.printPrompt();
    }
  }

  printPrompt() {
    this.logToTerminal('\nEnter your choice: ');
  }

  // ----------------------------------------------------------------------------
  // High-Level Actions
  // ----------------------------------------------------------------------------

  performSendPacket(source, destination, priority) {
    this.logToTerminal(`\nEnter source router: ${source}\n`);
    this.logToTerminal(`Enter destination router: ${destination}\n`);
    this.logToTerminal(`Enter packet priority: ${priority}\n`);

    try {
      const result = this.simulation.sendPacket(source, destination, priority);
      this.logToTerminal(result.output);
      this.visualizer.setRoute(result.route);

      // Animate packet on the topology canvas
      this.visualizer.animatePacketTransmission(result.route, () => {
        this.updateHUD();
      });

      if (result.usedFallback) {
        this.showToast('Note: Primary Dijkstra route severed; Adaptive Strategy recovered via BFS!');
      } else {
        this.showToast(`Packet #${result.packet.getId()} delivered successfully!`);
      }
    } catch (e) {
      sounds.playFailure();
      this.visualizer.setRoute([]);

      if (e instanceof RouterNotFoundException) {
        this.logToTerminal(`\nROUTER ERROR: ${e.message}\n`);
      } else if (e instanceof LinkNotFoundException) {
        this.logToTerminal(`\nLINK ERROR: ${e.message}\n`);
      } else if (e instanceof DestinationUnreachableException) {
        this.logToTerminal(`\nROUTING ERROR: ${e.message}\n`);
        this.visualizer.showGraphAlert('ROUTING ERROR: Destination is unreachable.');
      } else if (e instanceof NetworkException) {
        this.logToTerminal(`\nNETWORK ERROR: ${e.message}\n`);
      } else {
        this.logToTerminal(`\nGENERAL ERROR: ${e.message}\n`);
      }
      this.updateHUD();
    }

    this.printPrompt();
  }

  executeCompare(source, destination) {
    this.logToTerminal(`\nEnter source router: ${source}\n`);
    this.logToTerminal(`Enter destination router: ${destination}\n`);

    try {
      const { output, results } = this.simulation.compareAlgorithms(source, destination);
      this.logToTerminal(output);

      // Also update Comparison Tab UI
      this.populateAlgoCards(results);
      this.showToast('Algorithm comparison computed.');
    } catch (e) {
      if (e instanceof RouterNotFoundException) {
        this.logToTerminal(`\nROUTER ERROR: ${e.message}\n`);
      } else {
        this.logToTerminal(`\nERROR: ${e.message}\n`);
      }
    }

    this.printPrompt();
  }

  runAlgorithmComparisonUI(source, destination) {
    try {
      const { results } = this.simulation.compareAlgorithms(source, destination);
      this.populateAlgoCards(results);
      this.showToast('Comparison computed across BFS, DFS, Dijkstra, and Adaptive.');
    } catch (e) {
      this.showToast(`Comparison error: ${e.message}`, true);
    }
  }

  populateAlgoCards(results) {
    // BFS
    const bfs = results['BFS'];
    if (bfs && bfs.success) {
      document.getElementById('bfs-res-route').textContent = bfs.route.join(' ➔ ');
      document.getElementById('bfs-res-hops').textContent = bfs.hops;
      document.getElementById('bfs-res-cost').textContent = bfs.cost;
      document.getElementById('tbl-bfs-route').textContent = bfs.route.join(' ');
      document.getElementById('tbl-bfs-hops').textContent = bfs.hops;
      document.getElementById('tbl-bfs-cost').textContent = bfs.cost;
    } else {
      document.getElementById('bfs-res-route').textContent = 'Unreachable';
      document.getElementById('bfs-res-hops').textContent = '--';
      document.getElementById('bfs-res-cost').textContent = '--';
      document.getElementById('tbl-bfs-route').textContent = 'Unreachable';
      document.getElementById('tbl-bfs-hops').textContent = '--';
      document.getElementById('tbl-bfs-cost').textContent = '--';
    }

    // Dijkstra
    const dijk = results['Dijkstra'];
    if (dijk && dijk.success) {
      document.getElementById('dijkstra-res-route').textContent = dijk.route.join(' ➔ ');
      document.getElementById('dijkstra-res-hops').textContent = dijk.hops;
      document.getElementById('dijkstra-res-cost').textContent = dijk.cost;
      document.getElementById('tbl-dijkstra-route').textContent = dijk.route.join(' ');
      document.getElementById('tbl-dijkstra-hops').textContent = dijk.hops;
      document.getElementById('tbl-dijkstra-cost').textContent = dijk.cost;
    } else {
      document.getElementById('dijkstra-res-route').textContent = 'Unreachable';
      document.getElementById('dijkstra-res-hops').textContent = '--';
      document.getElementById('dijkstra-res-cost').textContent = '--';
      document.getElementById('tbl-dijkstra-route').textContent = 'Unreachable';
      document.getElementById('tbl-dijkstra-hops').textContent = '--';
      document.getElementById('tbl-dijkstra-cost').textContent = '--';
    }

    // Adaptive
    const adapt = results['Adaptive Routing'];
    if (adapt && adapt.success) {
      document.getElementById('adaptive-res-route').textContent = adapt.route.join(' ➔ ');
      document.getElementById('adaptive-res-hops').textContent = adapt.hops;
      document.getElementById('adaptive-res-cost').textContent = adapt.cost;
      document.getElementById('tbl-adaptive-route').textContent = adapt.route.join(' ');
      document.getElementById('tbl-adaptive-hops').textContent = adapt.hops;
      document.getElementById('tbl-adaptive-cost').textContent = adapt.cost;
    } else {
      document.getElementById('adaptive-res-route').textContent = 'Unreachable';
      document.getElementById('adaptive-res-hops').textContent = '--';
      document.getElementById('adaptive-res-cost').textContent = '--';
      document.getElementById('tbl-adaptive-route').textContent = 'Unreachable';
      document.getElementById('tbl-adaptive-hops').textContent = '--';
      document.getElementById('tbl-adaptive-cost').textContent = '--';
    }

    // DFS
    const dfs = results['DFS'];
    if (dfs && dfs.success) {
      document.getElementById('dfs-res-route').textContent = dfs.route.join(' ➔ ');
      document.getElementById('dfs-res-hops').textContent = dfs.hops;
      document.getElementById('dfs-res-cost').textContent = dfs.cost;
      document.getElementById('tbl-dfs-route').textContent = dfs.route.join(' ');
      document.getElementById('tbl-dfs-hops').textContent = dfs.hops;
      document.getElementById('tbl-dfs-cost').textContent = dfs.cost;
    } else {
      document.getElementById('dfs-res-route').textContent = 'Unreachable';
      document.getElementById('dfs-res-hops').textContent = '--';
      document.getElementById('dfs-res-cost').textContent = '--';
      document.getElementById('tbl-dfs-route').textContent = 'Unreachable';
      document.getElementById('tbl-dfs-hops').textContent = '--';
      document.getElementById('tbl-dfs-cost').textContent = '--';
    }
  }

  toggleLinkState(r1, r2, forceState = null) {
    const link = this.simulation.network.findLink(r1, r2);
    if (!link) {
      this.logToTerminal(`\nLINK ERROR: Link does not exist.\n`);
      this.printPrompt();
      return;
    }

    const newState = forceState !== null ? forceState : !link.isActive();

    if (newState) {
      const msg = this.simulation.repairLink(r1, r2);
      this.logToTerminal(msg);
      sounds.playRepair();
    } else {
      const msg = this.simulation.failLink(r1, r2);
      this.logToTerminal(msg);
      sounds.playFailure();
    }

    this.printPrompt();
    this.updateAfterTopologyChange();
  }

  toggleRouterState(id, forceState = null) {
    const router = this.simulation.network.findRouter(id);
    if (!router) {
      this.logToTerminal(`\nROUTER ERROR: Router does not exist.\n`);
      this.printPrompt();
      return;
    }

    const newState = forceState !== null ? forceState : !router.isActive();

    if (newState) {
      const msg = this.simulation.repairRouter(id);
      this.logToTerminal(msg);
      sounds.playRepair();
    } else {
      const msg = this.simulation.failRouter(id);
      this.logToTerminal(msg);
      sounds.playFailure();
    }

    this.printPrompt();
    this.updateAfterTopologyChange();
  }

  updateAfterTopologyChange() {
    this.visualizer.render();

    // Check if previous active route is broken, and dynamically reroute!
    if (this.visualizer.activeRoute && this.visualizer.activeRoute.length >= 2) {
      const src = this.visualizer.activeRoute[0];
      const dst = this.visualizer.activeRoute[this.visualizer.activeRoute.length - 1];

      try {
        const reroute = this.simulation.adaptive.findRoute(this.simulation.network, src, dst);
        this.visualizer.setRoute(reroute.path);
        this.showToast(`Dynamic adaptive rerouting updated route to ${reroute.path.join(' ➔ ')}`);
      } catch (e) {
        this.visualizer.setRoute([]);
        this.visualizer.showGraphAlert(`Current route from R${src} to R${dst} severed! Destination is unreachable.`);
      }
    }

    this.updateHUD();
  }

  healFullNetwork() {
    for (const r of this.simulation.network.routers) {
      r.setActive(true);
    }
    for (const l of this.simulation.network.links) {
      l.repair();
    }
    this.logToTerminal('\n[HEAL] Full network healed. All 8 routers and 12 links restored.\n');
    sounds.playRepair();
    this.printPrompt();
    this.updateAfterTopologyChange();
    this.showToast('All routers and links restored to ACTIVE!');
  }

  resetNetworkState() {
    this.simulation = new Simulation();
    this.simulation.createNetwork();
    this.visualizer.sim = this.simulation;
    this.visualizer.activeRoute = [];
    this.visualizer.resetPositions();
    this.visualizer.render();
    this.updateHUD();
    this.logToTerminal('\n[RESET] Network topology re-initialized to default.\n');
    this.printPrompt();
  }

  updateHUD() {
    const totalRouters = this.simulation.network.routers.length;
    const activeRouters = this.simulation.network.routers.filter(r => r.isActive()).length;

    const totalLinks = this.simulation.network.links.length;
    const activeLinks = this.simulation.network.links.filter(l => l.isActive()).length;

    const isConn = this.simulation.network.isConnected();

    // Header pills
    const rCountEl = document.getElementById('active-routers-count');
    const lCountEl = document.getElementById('active-links-count');
    const connDotEl = document.getElementById('conn-dot');
    const connTextEl = document.getElementById('conn-text');
    const rateEl = document.getElementById('delivery-rate-val');

    if (rCountEl) rCountEl.textContent = `${activeRouters}/${totalRouters} Active`;
    if (lCountEl) lCountEl.textContent = `${activeLinks}/${totalLinks} Active`;

    if (connDotEl && connTextEl) {
      if (isConn) {
        connDotEl.className = 'status-dot online';
        connTextEl.textContent = 'CONNECTED';
      } else {
        connDotEl.className = 'status-dot offline';
        connTextEl.textContent = 'DISCONNECTED';
      }
    }

    const { stats } = this.simulation.showStatistics();

    if (rateEl) {
      rateEl.textContent = stats.totalPackets > 0 ? `${stats.deliveryRate}%` : '100%';
    }

    // Deck HUD items
    const hudTotal = document.getElementById('hud-total-packets');
    const hudDelivered = document.getElementById('hud-delivered-packets');
    const hudLost = document.getElementById('hud-lost-packets');
    const hudRatio = document.getElementById('hud-delivery-ratio');

    if (hudTotal) hudTotal.textContent = String(stats.totalPackets);
    if (hudDelivered) hudDelivered.textContent = String(stats.deliveredPackets);
    if (hudLost) hudLost.textContent = String(stats.lostPackets);
    if (hudRatio) hudRatio.textContent = `${stats.deliveryRate}%`;

    // History badge count
    const badge = document.getElementById('history-badge');
    if (badge) badge.textContent = String(stats.totalRecords);
  }

  refreshPacketHistoryView() {
    // 1. Refresh router queues
    const queuesGrid = document.getElementById('router-queues-grid');
    if (queuesGrid) {
      let qHtml = '';
      for (const r of this.simulation.network.routers) {
        qHtml += `
          <div class="queue-card">
            <div class="queue-card-left">
              <span class="queue-router-title">Router R${r.getId()} (${r.getName()})</span>
              <span class="queue-router-status ${r.isActive() ? 'text-green' : 'text-danger'}">
                ${r.isActive() ? 'ONLINE' : 'FAILED'}
              </span>
            </div>
            <div class="queue-count-circle">${r.getQueueSize()}</div>
          </div>
        `;
      }
      queuesGrid.innerHTML = qHtml;
    }

    // 2. Refresh packet table
    const tableBody = document.getElementById('packets-table-body');
    if (!tableBody) return;

    if (this.simulation.packets.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="empty-table-msg">No packets transmitted yet. Use Menu Option 2 or Quick Send to begin simulation.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    for (let i = this.simulation.packets.length - 1; i >= 0; i--) {
      const pkt = this.simulation.packets[i];
      const routeStr = pkt.getRoute().length > 0 ? pkt.getRoute().join(' ➔ ') : 'None';
      const hops = pkt.getRoute().length > 0 ? pkt.getRoute().length - 1 : 0;
      const isSuccess = pkt.status === 'delivered';

      rowsHtml += `
        <tr>
          <td><strong>#${pkt.getId()}</strong></td>
          <td>Router ${pkt.getSource()}</td>
          <td>Router ${pkt.getDestination()}</td>
          <td><span class="badge ${pkt.getPriority() > 1 ? 'badge-warning' : 'badge-success'}">Pri: ${pkt.getPriority()}</span></td>
          <td class="code-font ${isSuccess ? 'highlight' : 'text-danger'}">${routeStr}</td>
          <td>${hops}</td>
          <td>
            <span class="badge ${isSuccess ? 'badge-success' : 'badge-danger'}">
              ${isSuccess ? 'DELIVERED' : 'LOST'}
            </span>
          </td>
          <td class="code-font">${pkt.timestamp}</td>
        </tr>
      `;
    }
    tableBody.innerHTML = rowsHtml;
  }
}

// ------------------------------------------------------------------------------
// INITIALIZE ON DOM READY
// ------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ApplicationController();
});
