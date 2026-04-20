const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();

const port = Number(process.env.PORT || 8081);
const facilitiesGrpcTarget = process.env.FACILITIES_GRPC_TARGET || "facilities-service:50052";
const protoPath = path.join(__dirname, "..", "proto", "facilities.proto");

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const loadedProto = grpc.loadPackageDefinition(packageDefinition);
const facilitiesApi = loadedProto.facilities.v1;

const facilitiesClient = new facilitiesApi.FacilitiesService(
  facilitiesGrpcTarget,
  grpc.credentials.createInsecure()
);

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

const grpcToPromise = (method, payload) => {
  return new Promise((resolve, reject) => {
    method.call(facilitiesClient, payload, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
};

app.get("/mobile/health", (_req, res) => {
  res.json({ status: "ok", service: "mobile-gateway" });
});

app.get("/mobile/facilities", async (_req, res) => {
  try {
    const response = await grpcToPromise(facilitiesClient.ListFacilities, {});
    res.json(response.facilities || []);
  } catch (error) {
    res.status(502).json({ message: "failed to list facilities", details: error.details || error.message });
  }
});

app.post("/mobile/facilities", async (req, res) => {
  const { name, type, capacity, location } = req.body || {};

  if (!name || !type || !capacity || !location) {
    res.status(400).json({ message: "name, type, capacity and location are required" });
    return;
  }

  try {
    const response = await grpcToPromise(facilitiesClient.CreateFacility, {
      name,
      type,
      capacity: Number(capacity),
      location
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(502).json({ message: "failed to create facility", details: error.details || error.message });
  }
});

app.get("/mobile/facilities/:id", async (req, res) => {
  try {
    const response = await grpcToPromise(facilitiesClient.GetFacility, { id: req.params.id });
    res.json(response);
  } catch (error) {
    const status = error.code === grpc.status.NOT_FOUND ? 404 : 502;
    res.status(status).json({ message: "failed to fetch facility", details: error.details || error.message });
  }
});

app.get("/mobile/facilities/:id/slots", async (req, res) => {
  const date = req.query.date;

  if (!date || typeof date !== "string") {
    res.status(400).json({ message: "query parameter 'date' is required (YYYY-MM-DD)" });
    return;
  }

  try {
    const response = await grpcToPromise(facilitiesClient.ListAvailableSlots, {
      facility_id: req.params.id,
      date
    });
    res.json(response.slots || []);
  } catch (error) {
    res.status(502).json({ message: "failed to list available slots", details: error.details || error.message });
  }
});

app.post("/mobile/facilities/:id/slots", async (req, res) => {
  const { startTime, endTime, isAvailable } = req.body || {};

  if (!startTime || !endTime) {
    res.status(400).json({ message: "startTime and endTime are required" });
    return;
  }

  try {
    const response = await grpcToPromise(facilitiesClient.CreateSlot, {
      facility_id: req.params.id,
      start_time: startTime,
      end_time: endTime,
      is_available: isAvailable !== undefined ? Boolean(isAvailable) : true
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(502).json({ message: "failed to create slot", details: error.details || error.message });
  }
});

app.listen(port, () => {
  console.log(`mobile-gateway listening on port ${port}`);
});
