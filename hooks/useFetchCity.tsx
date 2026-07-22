"use client";

import { useEffect, useState } from "react";

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export function useFetchCity(
  t: (path: string) => string,
  cityCode: string,
  districtCode: string,
) {
  const [cities, setCities] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setIsCitiesLoading(true);
        const res = await fetch("https://provinces.open-api.vn/api/v1/p/");
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setIsCitiesLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const fetchDistricts = async (provinceCode: string) => {
    try {
      setIsDistrictsLoading(true);
      const res = await fetch(
        `https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`,
      );
      const data = await res.json();
      setDistricts(data.districts ?? []);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      setDistricts([]);
    } finally {
      setIsDistrictsLoading(false);
    }
  };

  const fetchWards = async (districtCode: string) => {
    try {
      setIsWardsLoading(true);
      const res = await fetch(
        `https://provinces.open-api.vn/api/v1/d/${districtCode}?depth=2`,
      );
      const data = await res.json();
      setWards(data.wards ?? []);
    } catch (error) {
      console.error("Failed to fetch wards:", error);
      setWards([]);
    } finally {
      setIsWardsLoading(false);
    }
  };

  const resetDistricts = () => setDistricts([]);
  const resetWards = () => setWards([]);

  const citySelectData: SelectOption[] = isCitiesLoading
    ? [{ value: "", label: t("orderPage.info.loading") }]
    : [
        { value: "", label: t("orderPage.info.cityPlaceholder") },
        ...cities.map((city) => ({
          value: String(city.code),
          label: city.name,
        })),
      ];

  const districtSelectData: SelectOption[] = !cityCode
    ? [{ value: "", label: t("orderPage.info.selectCityFirst") }]
    : isDistrictsLoading
      ? [{ value: "", label: t("orderPage.info.loading") }]
      : [
          { value: "", label: t("orderPage.info.districtPlaceholder") },
          ...districts.map((district) => ({
            value: String(district.code),
            label: district.name,
          })),
        ];

  const wardSelectData: SelectOption[] = !districtCode
    ? [{ value: "", label: t("orderPage.info.selectDistrictFirst") }]
    : isWardsLoading
      ? [{ value: "", label: t("orderPage.info.loading") }]
      : [
          { value: "", label: t("orderPage.info.wardPlaceholder") },
          ...wards.map((ward) => ({
            value: String(ward.code),
            label: ward.name,
          })),
        ];

  return {
    cities,
    districts,
    wards,
    isCitiesLoading,
    isDistrictsLoading,
    isWardsLoading,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
    citySelectData,
    districtSelectData,
    wardSelectData,
  };
}
