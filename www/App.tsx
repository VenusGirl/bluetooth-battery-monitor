import React, { useEffect, useState } from "react/";
import { tw } from "twind";
import { clsx } from "clsx";

import {
  DeviceJson,
  SystemTime,
  get_bluetooth_info_all,
} from "./commands/bluetooth.ts";
import { update_info_interval } from "./commands/timer.ts";
import { Button } from "./components/button.tsx";
import { read_data, write_data } from "./commands/storage.ts";

export default function App() {
  const [result, setResult] = useState<DeviceJson[] | []>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  useEffect(() => {
    (async () => {
      const cache = await read_data<DeviceJson[]>("device_info");
      console.log(cache);
      const cacheId = await read_data<string>("selected_device_id");
      cache && setResult(cache);
      cacheId && setSelectedDeviceId(cacheId);
    })();
  }, []);

  async function getBatteryInfo_all() {
    try {
      await get_bluetooth_info_all(async (json_array) => {
        setResult(json_array);
        await write_data("device_info", JSON.stringify(json_array));
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function updateSystemTrayInterval() {
    const duration_time = 10;
    await update_info_interval(duration_time); // write battery info by backend
    setInterval(async () => {
      const cacheId = await read_data<string>("selected_device_id");
      if (cacheId) {
        setSelectedDeviceId(cacheId);
      }
    });
  }

  const selectDevice: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setSelectedDeviceId(e.currentTarget.value);
    write_data("selected_device_id", e.currentTarget.value);
  };

  return (
    <section>
      <div
        className={clsx(
          tw`grid grid-cols-2 place-items-stretch fixed w-full py-4`,
          "glass"
        )}
      >
        <Button callback={getBatteryInfo_all} idleText="Update info" />
        <Button
          callback={updateSystemTrayInterval}
          idleText="Interval battery"
        />
      </div>

      <div className={tw`grid gap-8 place-items-center pt-24 pb-5`}>
        {result.map((device) => {
          const bgColor =
            device.bluetooth_address === selectedDeviceId
              ? ({ backgroundColor: "#000000bf" } as const)
              : undefined;

          return (
            <button
              className={clsx(
                tw`grid grid-flow-row-dense grid-cols-1 gap-1 w-11/12 rounded-3xl py-3`,
                "glass"
              )}
              style={bgColor}
              key={device.instance_id}
              value={device.bluetooth_address}
              onClick={selectDevice}
            >
              {Object.keys(device).map((key) => {
                return (
                  <DeviceInfo
                    device={device}
                    device_key={key as keyof DeviceJson}
                  />
                );
              })}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DeviceInfo({
  device,
  device_key,
}: {
  device: DeviceJson;
  device_key: keyof DeviceJson;
}) {
  let value = device[device_key];
  if (device_key === "is_connected") {
    value = value ? "is paired" : "not paired";
  }
  if (
    ["instance_id", "friendly_name", "bluetooth_address"].includes(device_key)
  ) {
    return null;
  }
  if (["last_seen", "last_used"].includes(device_key)) {
    const val = value as SystemTime;
    value = `${val.year}/${val.month}/${val.day} - ${val.hour}:${val.minute}:${val.second}`;
  }

  return (
    <div
      key={device_key}
      className={tw`grid place-items-start my-1 mx-16 text-gray-100`}
    >
      {device_key}: {`${value}`}
    </div>
  );
}
