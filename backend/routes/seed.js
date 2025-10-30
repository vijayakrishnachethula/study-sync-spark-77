const fs = require('fs');
const path = require('path');

async function seedFromFrontendMocks(memoryRef, MongoModel) {
  // Attempt to read TS mock profiles
  const filePath = path.resolve(__dirname, '../../src/utils/mockProfiles.ts');
  const exists = fs.existsSync(filePath);
  if (!exists) return 0;
  const text = fs.readFileSync(filePath, 'utf8');

  // Extract array literal between first '[' and matching ']'
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return 0;
  let arrStr = text.slice(start, end + 1);

  // Transform TS-ish to JSON-safe
  // Replace single quotes with double quotes
  arrStr = arrStr.replace(/'([^']*)'/g, '"$1"');
  // Remove trailing commas before ] and }
  arrStr = arrStr.replace(/,\s*([\]\}])/g, '$1');

  let data;
  try {
    data = JSON.parse(arrStr);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[seed] Failed to parse mock profiles');
    return 0;
  }

  // Map to backend schema fields; ensure numeric id
  const users = data.map((u, idx) => ({
    id: Number(u.id) || idx + 1,
    name: u.name,
    courses: Array.isArray(u.courses) ? u.courses : [],
    schedule: String(u.schedule || ''),
    studyStyle: u.studyStyle,
    bio: u.bio,
    phone: u.phone || '',
    email: u.email || '',
    instagram: u.instagram || '',
  }));

  if (MongoModel) {
    for (const u of users) {
      await MongoModel.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    return users.length;
  }

  if (memoryRef) {
    const existingIds = new Set(memoryRef.users.map((u) => u.id));
    for (const u of users) {
      if (!existingIds.has(u.id)) memoryRef.users.push(u);
    }
    memoryRef.nextId = Math.max(memoryRef.nextId, users.length + 1);
    return users.length;
  }

  return 0;
}

module.exports = { seedFromFrontendMocks };


