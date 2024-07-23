const { createWriteStream } = require("node:fs");
const { homedir, platform } = require("os");
const MergeTrees = require("merge-trees");

const archiver = require("archiver");
const { Command } = require("commander");
const program = new Command();

const SUBFOLDERS = ["IRONCLAD", "THE_SILENT", "DEFECT", "WATCHER"];

// map platforms to history paths
const HISTORY_DIRS = {
  darwin: `${homedir}/Library/Application Support/Steam/steamapps/common/SlayTheSpire/SlayTheSpire.app/Contents/Resources/runs`,
  win32: `${homedir}`,
};

async function zipRunHistory() {
  const historyDir = HISTORY_DIRS[platform];

  const output = createWriteStream(`${__dirname}/sts_runs.zip`);
  var archive = archiver("zip");

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(historyDir, false);
  archive.finalize();
}

// add files from target dir to current machine's runs
async function syncRunHistory(targetDir) {
  const historyDir = HISTORY_DIRS[platform];
  const treeMerge = new MergeTrees(
    [targetDir, historyDir],
    `${__dirname}/output`,
    {
      overwrite: true,
    }
  );
  treeMerge.merge();
}

program.command("sync").action((str, options) => {
  if (!options.args[0]) {
    console.log("pleaes provide input dir");
    process.exit(1);
  }
  syncRunHistory(options.args[0]);
});
program.command("zip").action((str, options) => {
  zipRunHistory();
});

program.parse();
