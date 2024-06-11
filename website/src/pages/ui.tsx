import React from "react";
import Layout from "@theme/Layout";
// import { NLPIntegration } from "../partials/data_enhancement/NLPIntegration";
// import { CustomizationOptions } from "../partials/data_enhancement/CustomizationOptions";
// import { Testimonials } from "../partials/data_enhancement/Testimonials";
// import { Contact } from "../partials/data_enhancement/Contact";

function UiPage() {

    return (
        <Layout
            title="FireCMS UI, batteries included">
            <div>
                <section
                    className="relative overflow-hidden border-b border-slate-200 pt-1 bg-white text-text-primary">
                    <div className="max-w-5xl px-4 pb-20 pt-14 sm:mx-auto">
                        <div className="sm:text-center">
                            <a
                                className="group flex w-fit whitespace-nowrap rounded-md text-sm font-medium text-slate-800 transition-all sm:mx-auto sm:hidden"
                                target="_blank"
                                href="https://blocks.tremor.so"
                            >
                                <div className="flex items-center gap-3">
            <span className="relative rounded-md bg-blue-100/70 px-2 py-1 text-xs font-semibold text-blue-600">
              <span>New</span>
              <span
                  className="absolute -right-1 top-0 h-3 w-3 shrink-0 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-blue-500"/>
            </span>
                                    <span className="flex items-center gap-0.5">
              <span>Build faster with 250+ Blocks and Templates</span>
              <svg
                  className="-mr-1 ml-1.5 stroke-[1.5px]"
                  fill="none"
                  stroke="currentColor"
                  width={11}
                  height={11}
                  viewBox="0 0 10 10"
                  aria-hidden="true"
              >
                <path
                    className="opacity-0 transition group-hover:opacity-100"
                    d="M0 5h7"
                />
                <path
                    className="transition group-hover:translate-x-[3px]"
                    d="M1 1l4 4-4 4"
                />
              </svg>
            </span>
                                </div>
                            </a>
                            <div
                                className="mt-6 hidden cursor-default items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-600 sm:flex sm:justify-center">
                                <span>Built for</span>
                                <span className="flex items-center gap-1.5">
            <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 text-slate-400"
            >
              <path
                  d="M12.001 13.5001C11.1725 13.5001 10.501 12.8285 10.501 12.0001C10.501 11.1716 11.1725 10.5001 12.001 10.5001C12.8294 10.5001 13.501 11.1716 13.501 12.0001C13.501 12.8285 12.8294 13.5001 12.001 13.5001ZM11.4733 16.4945C11.6479 16.705 11.8239 16.908 12.001 17.103C12.178 16.908 12.3541 16.705 12.5286 16.4945C12.3538 16.4982 12.1779 16.5001 12.001 16.5001C11.824 16.5001 11.6481 16.4982 11.4733 16.4945ZM9.47837 16.3694C8.6762 16.2846 7.91035 16.1603 7.19268 16.0016C7.11832 16.3512 7.06134 16.6904 7.02243 17.0166C6.83358 18.6 7.09805 19.5617 7.50098 19.7943C7.9039 20.0269 8.86893 19.7751 10.1458 18.8199C10.4088 18.6231 10.6741 18.4042 10.9397 18.1649C10.4434 17.6228 9.95287 17.0217 9.47837 16.3694ZM16.8093 16.0016C16.0916 16.1603 15.3257 16.2846 14.5236 16.3694C14.0491 17.0217 13.5585 17.6228 13.0622 18.1649C13.3279 18.4042 13.5931 18.6231 13.8562 18.8199C15.133 19.7751 16.0981 20.0269 16.501 19.7943C16.9039 19.5617 17.1684 18.6 16.9795 17.0166C16.9406 16.6904 16.8836 16.3512 16.8093 16.0016ZM18.2598 15.6136C18.8364 18.2526 18.5328 20.3533 17.251 21.0933C15.9691 21.8334 13.9981 21.046 12.001 19.2271C10.0038 21.046 8.03282 21.8334 6.75098 21.0933C5.46913 20.3533 5.16555 18.2526 5.74217 15.6136C3.16842 14.7935 1.50098 13.4802 1.50098 12.0001C1.50098 10.5199 3.16842 9.20668 5.74217 8.38654C5.16555 5.74754 5.46913 3.64687 6.75098 2.9068C8.03282 2.16673 10.0038 2.95415 12.001 4.77302C13.9981 2.95415 15.9691 2.16673 17.251 2.9068C18.5328 3.64687 18.8364 5.74754 18.2598 8.38654C20.8335 9.20668 22.501 10.5199 22.501 12.0001C22.501 13.4802 20.8335 14.7935 18.2598 15.6136ZM10.9397 5.83521C10.6741 5.59597 10.4088 5.37703 10.1458 5.18024C8.86893 4.22499 7.9039 3.97321 7.50098 4.20584C7.09805 4.43847 6.83358 5.4001 7.02243 6.9835C7.06134 7.30969 7.11832 7.6489 7.19268 7.99857C7.91035 7.83985 8.6762 7.71556 9.47837 7.63078C9.95287 6.97848 10.4434 6.37737 10.9397 5.83521ZM14.5236 7.63078C15.3257 7.71556 16.0916 7.83985 16.8093 7.99857C16.8836 7.6489 16.9406 7.30969 16.9795 6.9835C17.1684 5.4001 16.9039 4.43847 16.501 4.20584C16.0981 3.97321 15.133 4.22499 13.8562 5.18024C13.5931 5.37703 13.3279 5.59597 13.0622 5.83521C13.5585 6.37737 14.0491 6.97848 14.5236 7.63078ZM12.5286 7.50565C12.3541 7.29515 12.178 7.09211 12.001 6.89711C11.8239 7.09211 11.6479 7.29515 11.4733 7.50565C11.6481 7.50194 11.824 7.50007 12.001 7.50007C12.1779 7.50007 12.3538 7.50194 12.5286 7.50565ZM8.37252 14.7042C8.28191 14.5547 8.19233 14.4033 8.10386 14.2501C8.01539 14.0968 7.92906 13.9435 7.84488 13.7903C7.74985 14.0467 7.66205 14.3007 7.58169 14.5515C7.83908 14.6074 8.10295 14.6583 8.37252 14.7042ZM10.3049 14.9377C10.8579 14.9788 11.4251 15.0001 12.001 15.0001C12.5769 15.0001 13.144 14.9788 13.697 14.9377C14.0091 14.4793 14.3111 13.9988 14.5991 13.5001C14.887 13.0013 15.1522 12.4995 15.393 12.0001C15.1522 11.5006 14.887 10.9988 14.5991 10.5001C14.3111 10.0013 14.0091 9.52081 13.697 9.06246C13.144 9.02133 12.5769 9.00007 12.001 9.00007C11.4251 9.00007 10.8579 9.02133 10.3049 9.06246C9.99283 9.52081 9.69086 10.0013 9.4029 10.5001C9.11494 10.9988 8.8498 11.5006 8.60892 12.0001C8.8498 12.4995 9.11494 13.0013 9.4029 13.5001C9.69086 13.9988 9.99283 14.4793 10.3049 14.9377ZM16.1571 10.2098C16.2521 9.9534 16.3399 9.6994 16.4203 9.44859C16.1629 9.39278 15.899 9.34182 15.6294 9.29591C15.72 9.44543 15.8096 9.59683 15.8981 9.75007C15.9866 9.9033 16.0729 10.0566 16.1571 10.2098ZM6.13143 9.83671C5.79142 9.94714 5.46917 10.0674 5.16723 10.1968C3.70154 10.825 3.00098 11.5348 3.00098 12.0001C3.00098 12.4653 3.70154 13.1752 5.16723 13.8033C5.46917 13.9327 5.79142 14.053 6.13143 14.1634C6.35281 13.4625 6.6281 12.7371 6.95576 12.0001C6.6281 11.263 6.35281 10.5376 6.13143 9.83671ZM7.58169 9.44859C7.66205 9.6994 7.74985 9.9534 7.84488 10.2098C7.92906 10.0566 8.01539 9.9033 8.10386 9.75007C8.19233 9.59683 8.28191 9.44543 8.37252 9.29591C8.10295 9.34182 7.83908 9.39278 7.58169 9.44859ZM17.8705 14.1634C18.2105 14.053 18.5328 13.9327 18.8347 13.8033C20.3004 13.1752 21.001 12.4653 21.001 12.0001C21.001 11.5348 20.3004 10.825 18.8347 10.1968C18.5328 10.0674 18.2105 9.94714 17.8705 9.83671C17.6491 10.5376 17.3739 11.263 17.0462 12.0001C17.3739 12.7371 17.6491 13.4625 17.8705 14.1634ZM16.4203 14.5515C16.3399 14.3007 16.2521 14.0467 16.1571 13.7903C16.0729 13.9435 15.9866 14.0968 15.8981 14.2501C15.8096 14.4033 15.72 14.5547 15.6294 14.7042C15.899 14.6583 16.1629 14.6074 16.4203 14.5515Z"
                  fill="currentColor"
              />
            </svg>
            <span>React</span>
          </span>
                                <span className="flex items-center gap-1.5">
            <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 133 80"
                className="h-4 text-slate-400"
            >
              <path
                  d="M66.5 0C48.7668 0 37.6832 8.86684 33.25 26.6C39.9 17.7332 47.6582 14.4082 56.525 16.625C61.5837 17.8895 65.1996 21.56 69.2021 25.6222C75.7222 32.2406 83.2679 39.9 99.75 39.9C117.483 39.9 128.567 31.0332 133 13.3C126.35 22.1668 118.592 25.4918 109.725 23.275C104.666 22.0105 101.05 18.34 97.0479 14.2778C90.5278 7.65945 82.9821 0 66.5 0ZM33.25 39.9C15.5168 39.9 4.43316 48.7668 0 66.5C6.65 57.6332 14.4082 54.3082 23.275 56.525C28.3337 57.7895 31.9496 61.46 35.9521 65.5222C42.4722 72.1405 50.0179 79.8 66.5 79.8C84.2332 79.8 95.3168 70.9332 99.75 53.2C93.1 62.0668 85.3418 65.3918 76.475 63.175C71.4163 61.9105 67.8004 58.24 63.7979 54.1778C57.2778 47.5594 49.7321 39.9 33.25 39.9Z"/>
            </svg>
            <span>Tailwind CSS</span>
          </span>
                            </div>
                            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:mt-8 sm:text-6xl">
          <span className="sm:hidden">
            React components to build dashboards
          </span>
                            </h1>
                            <p className="mt-6 leading-7 text-slate-700 sm:text-lg sm:leading-8">
          <span className="hidden sm:block">
            <span
                data-br=":r2:"
                data-brr={1}
                style={{
                    display: "inline-block",
                    verticalAlign: "top",
                    textDecoration: "inherit",
                    textWrap: "balance"
                }}
            >
              20+ open-source components built on top of Tailwind CSS to make
              visualizing data simple again. Fully open-source, accessible and
              customizable.
            </span>
          </span>
                                <span className="sm:hidden">
            20+ open-source components built on top of Tailwind CSS to make
            visualizing data simple again. Fully open-source, accessible and
            customizable.
          </span>
                            </p>
                            <div
                                className="mt-6 flex cursor-default items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-600 sm:hidden sm:justify-center">
                                <span>Built for</span>
                                <span className="flex items-center gap-1.5">
            <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 text-slate-400"
            >
              <path
                  d="M12.001 13.5001C11.1725 13.5001 10.501 12.8285 10.501 12.0001C10.501 11.1716 11.1725 10.5001 12.001 10.5001C12.8294 10.5001 13.501 11.1716 13.501 12.0001C13.501 12.8285 12.8294 13.5001 12.001 13.5001ZM11.4733 16.4945C11.6479 16.705 11.8239 16.908 12.001 17.103C12.178 16.908 12.3541 16.705 12.5286 16.4945C12.3538 16.4982 12.1779 16.5001 12.001 16.5001C11.824 16.5001 11.6481 16.4982 11.4733 16.4945ZM9.47837 16.3694C8.6762 16.2846 7.91035 16.1603 7.19268 16.0016C7.11832 16.3512 7.06134 16.6904 7.02243 17.0166C6.83358 18.6 7.09805 19.5617 7.50098 19.7943C7.9039 20.0269 8.86893 19.7751 10.1458 18.8199C10.4088 18.6231 10.6741 18.4042 10.9397 18.1649C10.4434 17.6228 9.95287 17.0217 9.47837 16.3694ZM16.8093 16.0016C16.0916 16.1603 15.3257 16.2846 14.5236 16.3694C14.0491 17.0217 13.5585 17.6228 13.0622 18.1649C13.3279 18.4042 13.5931 18.6231 13.8562 18.8199C15.133 19.7751 16.0981 20.0269 16.501 19.7943C16.9039 19.5617 17.1684 18.6 16.9795 17.0166C16.9406 16.6904 16.8836 16.3512 16.8093 16.0016ZM18.2598 15.6136C18.8364 18.2526 18.5328 20.3533 17.251 21.0933C15.9691 21.8334 13.9981 21.046 12.001 19.2271C10.0038 21.046 8.03282 21.8334 6.75098 21.0933C5.46913 20.3533 5.16555 18.2526 5.74217 15.6136C3.16842 14.7935 1.50098 13.4802 1.50098 12.0001C1.50098 10.5199 3.16842 9.20668 5.74217 8.38654C5.16555 5.74754 5.46913 3.64687 6.75098 2.9068C8.03282 2.16673 10.0038 2.95415 12.001 4.77302C13.9981 2.95415 15.9691 2.16673 17.251 2.9068C18.5328 3.64687 18.8364 5.74754 18.2598 8.38654C20.8335 9.20668 22.501 10.5199 22.501 12.0001C22.501 13.4802 20.8335 14.7935 18.2598 15.6136ZM10.9397 5.83521C10.6741 5.59597 10.4088 5.37703 10.1458 5.18024C8.86893 4.22499 7.9039 3.97321 7.50098 4.20584C7.09805 4.43847 6.83358 5.4001 7.02243 6.9835C7.06134 7.30969 7.11832 7.6489 7.19268 7.99857C7.91035 7.83985 8.6762 7.71556 9.47837 7.63078C9.95287 6.97848 10.4434 6.37737 10.9397 5.83521ZM14.5236 7.63078C15.3257 7.71556 16.0916 7.83985 16.8093 7.99857C16.8836 7.6489 16.9406 7.30969 16.9795 6.9835C17.1684 5.4001 16.9039 4.43847 16.501 4.20584C16.0981 3.97321 15.133 4.22499 13.8562 5.18024C13.5931 5.37703 13.3279 5.59597 13.0622 5.83521C13.5585 6.37737 14.0491 6.97848 14.5236 7.63078ZM12.5286 7.50565C12.3541 7.29515 12.178 7.09211 12.001 6.89711C11.8239 7.09211 11.6479 7.29515 11.4733 7.50565C11.6481 7.50194 11.824 7.50007 12.001 7.50007C12.1779 7.50007 12.3538 7.50194 12.5286 7.50565ZM8.37252 14.7042C8.28191 14.5547 8.19233 14.4033 8.10386 14.2501C8.01539 14.0968 7.92906 13.9435 7.84488 13.7903C7.74985 14.0467 7.66205 14.3007 7.58169 14.5515C7.83908 14.6074 8.10295 14.6583 8.37252 14.7042ZM10.3049 14.9377C10.8579 14.9788 11.4251 15.0001 12.001 15.0001C12.5769 15.0001 13.144 14.9788 13.697 14.9377C14.0091 14.4793 14.3111 13.9988 14.5991 13.5001C14.887 13.0013 15.1522 12.4995 15.393 12.0001C15.1522 11.5006 14.887 10.9988 14.5991 10.5001C14.3111 10.0013 14.0091 9.52081 13.697 9.06246C13.144 9.02133 12.5769 9.00007 12.001 9.00007C11.4251 9.00007 10.8579 9.02133 10.3049 9.06246C9.99283 9.52081 9.69086 10.0013 9.4029 10.5001C9.11494 10.9988 8.8498 11.5006 8.60892 12.0001C8.8498 12.4995 9.11494 13.0013 9.4029 13.5001C9.69086 13.9988 9.99283 14.4793 10.3049 14.9377ZM16.1571 10.2098C16.2521 9.9534 16.3399 9.6994 16.4203 9.44859C16.1629 9.39278 15.899 9.34182 15.6294 9.29591C15.72 9.44543 15.8096 9.59683 15.8981 9.75007C15.9866 9.9033 16.0729 10.0566 16.1571 10.2098ZM6.13143 9.83671C5.79142 9.94714 5.46917 10.0674 5.16723 10.1968C3.70154 10.825 3.00098 11.5348 3.00098 12.0001C3.00098 12.4653 3.70154 13.1752 5.16723 13.8033C5.46917 13.9327 5.79142 14.053 6.13143 14.1634C6.35281 13.4625 6.6281 12.7371 6.95576 12.0001C6.6281 11.263 6.35281 10.5376 6.13143 9.83671ZM7.58169 9.44859C7.66205 9.6994 7.74985 9.9534 7.84488 10.2098C7.92906 10.0566 8.01539 9.9033 8.10386 9.75007C8.19233 9.59683 8.28191 9.44543 8.37252 9.29591C8.10295 9.34182 7.83908 9.39278 7.58169 9.44859ZM17.8705 14.1634C18.2105 14.053 18.5328 13.9327 18.8347 13.8033C20.3004 13.1752 21.001 12.4653 21.001 12.0001C21.001 11.5348 20.3004 10.825 18.8347 10.1968C18.5328 10.0674 18.2105 9.94714 17.8705 9.83671C17.6491 10.5376 17.3739 11.263 17.0462 12.0001C17.3739 12.7371 17.6491 13.4625 17.8705 14.1634ZM16.4203 14.5515C16.3399 14.3007 16.2521 14.0467 16.1571 13.7903C16.0729 13.9435 15.9866 14.0968 15.8981 14.2501C15.8096 14.4033 15.72 14.5547 15.6294 14.7042C15.899 14.6583 16.1629 14.6074 16.4203 14.5515Z"
                  fill="currentColor"
              />
            </svg>
            <span>React</span>
          </span>
                                <span className="flex items-center gap-1.5">
            <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 133 80"
                className="h-4 text-slate-400"
            >
              <path
                  d="M66.5 0C48.7668 0 37.6832 8.86684 33.25 26.6C39.9 17.7332 47.6582 14.4082 56.525 16.625C61.5837 17.8895 65.1996 21.56 69.2021 25.6222C75.7222 32.2406 83.2679 39.9 99.75 39.9C117.483 39.9 128.567 31.0332 133 13.3C126.35 22.1668 118.592 25.4918 109.725 23.275C104.666 22.0105 101.05 18.34 97.0479 14.2778C90.5278 7.65945 82.9821 0 66.5 0ZM33.25 39.9C15.5168 39.9 4.43316 48.7668 0 66.5C6.65 57.6332 14.4082 54.3082 23.275 56.525C28.3337 57.7895 31.9496 61.46 35.9521 65.5222C42.4722 72.1405 50.0179 79.8 66.5 79.8C84.2332 79.8 95.3168 70.9332 99.75 53.2C93.1 62.0668 85.3418 65.3918 76.475 63.175C71.4163 61.9105 67.8004 58.24 63.7979 54.1778C57.2778 47.5594 49.7321 39.9 33.25 39.9Z"/>
            </svg>
            <span>Tailwind CSS</span>
          </span>
                            </div>
                            <div className="mt-6 sm:mt-10 sm:flex sm:items-center sm:justify-center sm:gap-x-4">
                                <a
                                    className="inline-flex cursor-pointer items-center justify-center rounded-md py-2 sm:text-sm font-medium disabled:pointer-events-none disabled:opacity-60 transition-all ease-in-out focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 relative group bg-gradient-to-b from-blue-500 to-blue-600 hover:opacity-90 text-white active:scale-[99%] duration-200 shadow-sm h-10 w-full px-5 sm:w-fit"
                                    href="https://blocks.tremor.so"
                                >
                                    Get started
                                </a>
                                <button
                                    role="button"
                                    type="button"
                                    aria-label="Copy code"
                                    className="group rounded-md p-1.5 mt-2 flex h-10 w-full items-center justify-center gap-x-2 border border-slate-200 bg-white pl-5 pr-3 font-mono text-sm font-medium shadow-sm hover:bg-slate-50 sm:mt-0 sm:h-[42px] sm:w-fit"
                                >
                                    npm i @tremor/react
                                    <svg
                                        aria-hidden="true"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="transition-all"
                                    >
                                        <path
                                            d="M14 9.5V7C14 5.89543 13.1046 5 12 5H7C5.89543 5 5 5.89543 5 7V12C5 13.1046 5.89543 14 7 14H9.5"
                                            strokeWidth="1.5"
                                            className="stroke-slate-500 group-hover:stroke-slate-700 transition-all"
                                        />
                                        <rect
                                            x={10}
                                            y={10}
                                            width={9}
                                            height={9}
                                            rx={2}
                                            strokeWidth="1.5"
                                            className="fill-slate-500/0 stroke-slate-500 group-hover:stroke-slate-700 transition-all"
                                        />
                                        <path
                                            d="M12 9L10 11L14 15"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="8.5"
                                            strokeDashoffset="8.5"
                                            className="stroke-slate-100/0 transition-opacity"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <section className="mx-auto max-w-7xl px-4 sm:px-8">
                        <div className="relative mx-auto grid grid-cols-12 gap-6 pb-20">
                            <div className="col-span-full lg:col-span-7">
                                <div className="shadow-slate-600 rounded-xl">
                                    <div
                                        className="z-10 h-full overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div
                                                className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand rounded-slate-600-small ring-slate-200">
                                                <h3 className="text-slate-600-default text-slate-600-content">
                                                    Portfolio Value
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tighter text-slate-600-content-strong sm:text-3xl">
                                                    <span>$328,505.10</span>
                                                </p>
                                                <div className="w-full mt-6 hidden h-60 sm:block">
                                                    <div
                                                        className="recharts-responsive-container h-full w-full"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            minWidth: 0
                                                        }}
                                                    >
                                                        <div
                                                            className="recharts-wrapper"
                                                            style={{
                                                                position: "relative",
                                                                cursor: "default",
                                                                width: "100%",
                                                                height: "100%",
                                                                maxHeight: 240,
                                                                maxWidth: 550
                                                            }}
                                                        >
                                                            <svg
                                                                className="recharts-surface"
                                                                width={550}
                                                                height={240}
                                                                viewBox="0 0 550 240"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%"
                                                                }}
                                                            >
                                                                <title/>
                                                                <desc/>
                                                                <defs>
                                                                    <clipPath id="recharts36-clip">
                                                                        <rect x={0} y={49} height={161} width={550}/>
                                                                    </clipPath>
                                                                </defs>
                                                                <g className="recharts-cartesian-grid">
                                                                    <g className="recharts-cartesian-grid-horizontal">
                                                                        <line
                                                                            className="stroke-1 stroke-slate-600-border dark:stroke-dark-slate-600-border"
                                                                            stroke="#ccc"
                                                                            fill="none"
                                                                            x={0}
                                                                            y={49}
                                                                            width={550}
                                                                            height={161}
                                                                            x1={0}
                                                                            y1={210}
                                                                            x2={550}
                                                                            y2={210}
                                                                        />
                                                                        <line
                                                                            className="stroke-1 stroke-slate-600-border dark:stroke-dark-slate-600-border"
                                                                            stroke="#ccc"
                                                                            fill="none"
                                                                            x={0}
                                                                            y={49}
                                                                            width={550}
                                                                            height={161}
                                                                            x1={0}
                                                                            y1="169.75"
                                                                            x2={550}
                                                                            y2="169.75"
                                                                        />
                                                                        <line
                                                                            className="stroke-1 stroke-slate-600-border dark:stroke-dark-slate-600-border"
                                                                            stroke="#ccc"
                                                                            fill="none"
                                                                            x={0}
                                                                            y={49}
                                                                            width={550}
                                                                            height={161}
                                                                            x1={0}
                                                                            y1="129.5"
                                                                            x2={550}
                                                                            y2="129.5"
                                                                        />
                                                                        <line
                                                                            className="stroke-1 stroke-slate-600-border dark:stroke-dark-slate-600-border"
                                                                            stroke="#ccc"
                                                                            fill="none"
                                                                            x={0}
                                                                            y={49}
                                                                            width={550}
                                                                            height={161}
                                                                            x1={0}
                                                                            y1="89.25"
                                                                            x2={550}
                                                                            y2="89.25"
                                                                        />
                                                                        <line
                                                                            className="stroke-1 stroke-slate-600-border dark:stroke-dark-slate-600-border"
                                                                            stroke="#ccc"
                                                                            fill="none"
                                                                            x={0}
                                                                            y={49}
                                                                            width={550}
                                                                            height={161}
                                                                            x1={0}
                                                                            y1={49}
                                                                            x2={550}
                                                                            y2={49}
                                                                        />
                                                                    </g>
                                                                </g>
                                                                <g className="recharts-layer recharts-cartesian-axis recharts-xAxis xAxis text-slate-600-label fill-slate-600-content dark:fill-dark-slate-600-content">
                                                                    <g className="recharts-cartesian-axis-ticks">
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x={20}
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x={20} dy="0.71em">
                                                                                    Aug 25
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="99.6875"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="99.6875" dy="0.71em">
                                                                                    Aug 30
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="179.375"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="179.375" dy="0.71em">
                                                                                    Sep 04
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="259.0625"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="259.0625" dy="0.71em">
                                                                                    Sep 09
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="338.75"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="338.75" dy="0.71em">
                                                                                    Sep 14
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="418.4375"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="418.4375" dy="0.71em">
                                                                                    Sep 19
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                        <g className="recharts-layer recharts-cartesian-axis-tick">
                                                                            <text
                                                                                stroke="none"
                                                                                height={30}
                                                                                orientation="bottom"
                                                                                width={550}
                                                                                transform="translate(0, 6)"
                                                                                x="498.125"
                                                                                y={218}
                                                                                className="recharts-text recharts-cartesian-axis-tick-value"
                                                                                textAnchor="middle"
                                                                                fill=""
                                                                            >
                                                                                <tspan x="498.125" dy="0.71em">
                                                                                    Sep 24
                                                                                </tspan>
                                                                            </text>
                                                                        </g>
                                                                    </g>
                                                                </g>
                                                                <g className="recharts-layer recharts-line stroke-blue-500 dark:stroke-blue-500">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={1}
                                                                        name="ETF Shares Vital"
                                                                        stroke=""
                                                                        strokeWidth={2}
                                                                        strokeLinejoin="round"
                                                                        strokeLinecap="round"
                                                                        fill="none"
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,154.561L35.938,142.406L51.875,165.637L67.813,147.079L83.75,118.375L99.688,119.853L115.625,131.874L131.563,137.244L147.5,120.611L163.438,119.273L179.375,129.993L195.313,134.066L211.25,113.859L227.188,165.875L243.125,191.854L259.063,179.478L275,141.584L290.938,131.75L306.875,128.175L322.813,95.157L338.75,107.781L354.688,129.386L370.625,131.277L386.563,119.635L402.5,101.482L418.438,94.607L434.375,92.536L450.313,83.595L466.25,82.579L482.188,81.841L498.125,76.281L514.063,67.18L530,54.82"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots"/>
                                                                </g>
                                                                <g className="recharts-layer recharts-line stroke-cyan-500 dark:stroke-cyan-500">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={1}
                                                                        name="Vitainvest Core"
                                                                        stroke=""
                                                                        strokeWidth={2}
                                                                        strokeLinejoin="round"
                                                                        strokeLinecap="round"
                                                                        fill="none"
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,190.519L35.938,190.695L51.875,191.21L67.813,183.753L83.75,181.168L99.688,176.198L115.625,172.52L131.563,166.717L147.5,163.907L163.438,163.178L179.375,160.999L195.313,158.649L211.25,149.68L227.188,139.94L243.125,130.008L259.063,121.162L275,119.31L290.938,116.609L306.875,112.203L322.813,110.955L338.75,110.464L354.688,107.923L370.625,116.073L386.563,130.186L402.5,118.658L418.438,119.646L434.375,101.483L450.313,91.822L466.25,101.205L482.188,120.233L498.125,129.633L514.063,123.238L530,112.117"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots"/>
                                                                </g>
                                                                <g className="recharts-layer recharts-line stroke-fuchsia-500 dark:stroke-fuchsia-500">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={1}
                                                                        name="iShares Tech Growth"
                                                                        stroke=""
                                                                        strokeWidth={2}
                                                                        strokeLinejoin="round"
                                                                        strokeLinecap="round"
                                                                        fill="none"
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,111.894L35.938,111.082L51.875,103.529L67.813,101.385L83.75,94.347L99.688,89.961L115.625,80.814L131.563,80.018L147.5,82.242L163.438,84.072L179.375,86.033L195.313,88.899L211.25,87.969L227.188,79.15L243.125,88.255L259.063,98.058L275,110.325L290.938,130.133L306.875,130.008L322.813,138.996L338.75,142.618L354.688,146.491L370.625,151.574L386.563,171.246L402.5,139.809L418.438,145.392L434.375,148.282L450.313,156.94L466.25,160.116L482.188,161.349L498.125,170.08L514.063,173.12L530,174.803"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots"/>
                                                                </g>
                                                                <g className="recharts-layer recharts-line cursor-pointer">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={0}
                                                                        name="ETF Shares Vital"
                                                                        stroke="transparent"
                                                                        fill="none"
                                                                        strokeWidth={12}
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,154.561L35.938,142.406L51.875,165.637L67.813,147.079L83.75,118.375L99.688,119.853L115.625,131.874L131.563,137.244L147.5,120.611L163.438,119.273L179.375,129.993L195.313,134.066L211.25,113.859L227.188,165.875L243.125,191.854L259.063,179.478L275,141.584L290.938,131.75L306.875,128.175L322.813,95.157L338.75,107.781L354.688,129.386L370.625,131.277L386.563,119.635L402.5,101.482L418.438,94.607L434.375,92.536L450.313,83.595L466.25,82.579L482.188,81.841L498.125,76.281L514.063,67.18L530,54.82"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots">
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={20}
                                                                            cy="154.56054444444445"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="35.9375"
                                                                            cy="142.4059388888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="51.875"
                                                                            cy="165.63734444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="67.8125"
                                                                            cy="147.0794111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="83.75"
                                                                            cy="118.37490000000001"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="99.6875"
                                                                            cy="119.85341666666667"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="115.625"
                                                                            cy="131.87385555555556"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="131.5625"
                                                                            cy="137.2441"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="147.5"
                                                                            cy="120.61101111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="163.4375"
                                                                            cy="119.27292222222223"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="179.375"
                                                                            cy="129.9928388888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="195.3125"
                                                                            cy="134.06613888888887"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="211.25"
                                                                            cy="113.85884999999999"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="227.1875"
                                                                            cy="165.87526666666668"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="243.125"
                                                                            cy="191.85351111111112"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="259.0625"
                                                                            cy="179.47797777777777"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={275}
                                                                            cy="141.58394444444446"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="290.9375"
                                                                            cy="131.74952777777779"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="306.875"
                                                                            cy="128.17532777777777"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="322.8125"
                                                                            cy="95.15691111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="338.75"
                                                                            cy="107.7811"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="354.6875"
                                                                            cy="129.3855111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="370.625"
                                                                            cy="131.2772611111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="386.5625"
                                                                            cy="119.63517222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="402.5"
                                                                            cy="101.48152777777779"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="418.4375"
                                                                            cy="94.60682777777777"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="434.375"
                                                                            cy="92.53618888888887"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="450.3125"
                                                                            cy="83.59532222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="466.25"
                                                                            cy="82.57923333333333"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="482.1875"
                                                                            cy="81.84131666666667"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="498.125"
                                                                            cy="76.28145"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="514.0625"
                                                                            cy="67.17958333333334"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="ETF Shares Vital"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={530}
                                                                            cy="54.820150000000005"
                                                                        />
                                                                    </g>
                                                                </g>
                                                                <g className="recharts-layer recharts-line cursor-pointer">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={0}
                                                                        name="Vitainvest Core"
                                                                        stroke="transparent"
                                                                        fill="none"
                                                                        strokeWidth={12}
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,190.519L35.938,190.695L51.875,191.21L67.813,183.753L83.75,181.168L99.688,176.198L115.625,172.52L131.563,166.717L147.5,163.907L163.438,163.178L179.375,160.999L195.313,158.649L211.25,149.68L227.188,139.94L243.125,130.008L259.063,121.162L275,119.31L290.938,116.609L306.875,112.203L322.813,110.955L338.75,110.464L354.688,107.923L370.625,116.073L386.563,130.186L402.5,118.658L418.438,119.646L434.375,101.483L450.313,91.822L466.25,101.205L482.188,120.233L498.125,129.633L514.063,123.238L530,112.117"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots">
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={20}
                                                                            cy="190.519"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="35.9375"
                                                                            cy="190.69520555555553"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="51.875"
                                                                            cy="191.2095111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="67.8125"
                                                                            cy="183.7534222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="83.75"
                                                                            cy="181.16847777777778"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="99.6875"
                                                                            cy="176.19805000000002"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="115.625"
                                                                            cy="172.52009444444445"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="131.5625"
                                                                            cy="166.7169388888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="147.5"
                                                                            cy="163.90659444444447"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="163.4375"
                                                                            cy="163.1776222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="179.375"
                                                                            cy="160.99875555555556"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="195.3125"
                                                                            cy="158.64905"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="211.25"
                                                                            cy="149.67956111111113"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="227.1875"
                                                                            cy="139.93995555555557"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="243.125"
                                                                            cy="130.00804444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="259.0625"
                                                                            cy="121.1619888888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={275}
                                                                            cy="119.31048888888887"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="290.9375"
                                                                            cy="116.60926666666666"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="306.875"
                                                                            cy="112.20323333333334"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="322.8125"
                                                                            cy="110.95458888888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="338.75"
                                                                            cy="110.46353888888888"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="354.6875"
                                                                            cy="107.92331666666666"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="370.625"
                                                                            cy="116.07349444444445"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="386.5625"
                                                                            cy="130.1860388888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="402.5"
                                                                            cy="118.65843888888888"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="418.4375"
                                                                            cy="119.64590555555554"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="434.375"
                                                                            cy="101.48331666666668"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="450.3125"
                                                                            cy="91.82152777777779"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="466.25"
                                                                            cy="101.20514444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="482.1875"
                                                                            cy="120.2326611111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="498.125"
                                                                            cy="129.63327222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="514.0625"
                                                                            cy="123.23799444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="Vitainvest Core"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={530}
                                                                            cy="112.11736666666667"
                                                                        />
                                                                    </g>
                                                                </g>
                                                                <g className="recharts-layer recharts-line cursor-pointer">
                                                                    <path
                                                                        className="recharts-curve recharts-line-curve"
                                                                        strokeOpacity={0}
                                                                        name="iShares Tech Growth"
                                                                        stroke="transparent"
                                                                        fill="none"
                                                                        strokeWidth={12}
                                                                        width={550}
                                                                        height={161}
                                                                        d="M20,111.894L35.938,111.082L51.875,103.529L67.813,101.385L83.75,94.347L99.688,89.961L115.625,80.814L131.563,80.018L147.5,82.242L163.438,84.072L179.375,86.033L195.313,88.899L211.25,87.969L227.188,79.15L243.125,88.255L259.063,98.058L275,110.325L290.938,130.133L306.875,130.008L322.813,138.996L338.75,142.618L354.688,146.491L370.625,151.574L386.563,171.246L402.5,139.809L418.438,145.392L434.375,148.282L450.313,156.94L466.25,160.116L482.188,161.349L498.125,170.08L514.063,173.12L530,174.803"
                                                                    />
                                                                    <g className="recharts-layer"/>
                                                                    <g className="recharts-layer recharts-line-dots">
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={20}
                                                                            cy="111.89375555555556"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="35.9375"
                                                                            cy="111.08249444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="51.875"
                                                                            cy="103.52891111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="67.8125"
                                                                            cy="101.38492777777779"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="83.75"
                                                                            cy="94.34743888888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="99.6875"
                                                                            cy="89.96108333333332"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="115.625"
                                                                            cy="80.81360000000001"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="131.5625"
                                                                            cy="80.01843888888888"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="147.5"
                                                                            cy="82.24202777777776"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="163.4375"
                                                                            cy="84.07206111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="179.375"
                                                                            cy="86.03268333333332"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="195.3125"
                                                                            cy="88.89937777777777"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="211.25"
                                                                            cy="87.96915555555555"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="227.1875"
                                                                            cy="79.14993333333331"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="243.125"
                                                                            cy="88.25537777777777"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="259.0625"
                                                                            cy="98.05848888888889"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={275}
                                                                            cy="110.3249"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="290.9375"
                                                                            cy="130.13326666666669"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="306.875"
                                                                            cy="130.00804444444444"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="322.8125"
                                                                            cy="138.99631666666667"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="338.75"
                                                                            cy="142.6179222222222"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="354.6875"
                                                                            cy="146.49086666666668"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="370.625"
                                                                            cy="151.57399444444445"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="386.5625"
                                                                            cy="171.2455111111111"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="402.5"
                                                                            cy="139.80936666666668"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="418.4375"
                                                                            cy="145.39159444444445"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="434.375"
                                                                            cy="148.28154444444442"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="450.3125"
                                                                            cy="156.93976666666666"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="466.25"
                                                                            cy="160.11593888888888"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="482.1875"
                                                                            cy="161.34937777777776"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="498.125"
                                                                            cy="170.08005"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx="514.0625"
                                                                            cy="173.12026666666668"
                                                                        />
                                                                        <circle
                                                                            r={3}
                                                                            className="recharts-dot recharts-line-dot"
                                                                            strokeOpacity={0}
                                                                            name="iShares Tech Growth"
                                                                            stroke="transparent"
                                                                            fill="transparent"
                                                                            strokeWidth={12}
                                                                            width={550}
                                                                            height={161}
                                                                            cx={530}
                                                                            cy="174.80271666666667"
                                                                        />
                                                                    </g>
                                                                </g>
                                                            </svg>
                                                            <div
                                                                className="recharts-legend-wrapper"
                                                                style={{
                                                                    position: "absolute",
                                                                    width: 550,
                                                                    height: 44,
                                                                    left: 0,
                                                                    top: 5
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-end">
                                                                    <ol className=" relative overflow-hidden">
                                                                        <div
                                                                            tabIndex={0}
                                                                            className="h-full flex flex-wrap"
                                                                        >
                                                                            <li className=" group inline-flex items-center px-2 py-0.5 rounded-slate-600-small transition whitespace-nowrap cursor-pointer text-slate-600-content hover:bg-slate-600-background-subtle dark:text-dark-slate-600-content dark:hover:bg-dark-slate-600-background-subtle">
                                                                                <svg
                                                                                    className="flex-none h-2 w-2 mr-1.5 text-blue-500 dark:text-blue-500 opacity-100"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 8 8"
                                                                                >
                                                                                    <circle cx={4} cy={4} r={4}/>
                                                                                </svg>
                                                                                <p className="whitespace-nowrap truncate text-slate-600-default text-slate-600-content group-hover:text-slate-600-content-emphasis dark:text-dark-slate-600-content opacity-100 dark:group-hover:text-dark-slate-600-content-emphasis">
                                                                                    ETF Shares Vital
                                                                                </p>
                                                                            </li>
                                                                            <li className=" group inline-flex items-center px-2 py-0.5 rounded-slate-600-small transition whitespace-nowrap cursor-pointer text-slate-600-content hover:bg-slate-600-background-subtle dark:text-dark-slate-600-content dark:hover:bg-dark-slate-600-background-subtle">
                                                                                <svg
                                                                                    className="flex-none h-2 w-2 mr-1.5 text-cyan-500 dark:text-cyan-500 opacity-100"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 8 8"
                                                                                >
                                                                                    <circle cx={4} cy={4} r={4}/>
                                                                                </svg>
                                                                                <p className="whitespace-nowrap truncate text-slate-600-default text-slate-600-content group-hover:text-slate-600-content-emphasis dark:text-dark-slate-600-content opacity-100 dark:group-hover:text-dark-slate-600-content-emphasis">
                                                                                    Vitainvest Core
                                                                                </p>
                                                                            </li>
                                                                            <li className=" group inline-flex items-center px-2 py-0.5 rounded-slate-600-small transition whitespace-nowrap cursor-pointer text-slate-600-content hover:bg-slate-600-background-subtle dark:text-dark-slate-600-content dark:hover:bg-dark-slate-600-background-subtle">
                                                                                <svg
                                                                                    className="flex-none h-2 w-2 mr-1.5 text-fuchsia-500 dark:text-fuchsia-500 opacity-100"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 8 8"
                                                                                >
                                                                                    <circle cx={4} cy={4} r={4}/>
                                                                                </svg>
                                                                                <p className="whitespace-nowrap truncate text-slate-600-default text-slate-600-content group-hover:text-slate-600-content-emphasis dark:text-dark-slate-600-content opacity-100 dark:group-hover:text-dark-slate-600-content-emphasis">
                                                                                    iShares Tech Growth
                                                                                </p>
                                                                            </li>
                                                                        </div>
                                                                    </ol>
                                                                </div>
                                                            </div>
                                                            <div
                                                                tabIndex={-1}
                                                                className="recharts-tooltip-wrapper"
                                                                style={{
                                                                    visibility: "hidden",
                                                                    pointerEvents: "none",
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    left: 0,
                                                                    outline: "none"
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full mt-6 h-48 sm:hidden">
                                                    <div
                                                        className="recharts-responsive-container h-full w-full"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            minWidth: 0
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                Charts
                                            </p>
                                            <p className="mt-1 leading-7 text-slate-500">
                                                Charts are hard, so we already pushed the pixels that you can
                                                focus on data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-6 lg:col-span-5">
                                <div
                                    className="shadow-slate-600 h-full rounded-xl"
                                    style={{
                                        animationDelay: "550ms",
                                        animationFillMode: "backwards"
                                    }}
                                >
                                    <div
                                        className="z-10 h-full overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="h-full overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div
                                                className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand rounded-slate-600-small ring-slate-200">
                                                <p className="font-medium text-slate-600-content-strong">
                                                    Activity overview
                                                </p>
                                                <p className="text-slate-600-default text-slate-600-content">
                                                    Februar 2024
                                                </p>
                                                <ul className=" w-full divide-y divide-slate-600-border text-slate-600-content dark:divide-dark-slate-600-border dark:text-dark-slate-600-content mt-4">
                                                    <li className=" w-full flex justify-between items-center text-slate-600-default py-2 space-x-3 truncate">
                                                        <div className="flex space-x-2.5 truncate px-2 py-1">
                        <span
                            className="bg-blue-500 w-1 shrink-0 rounded-sm"
                            aria-hidden="true"
                        />
                                                            <span className="truncate">Vitainvest Core</span>
                                                        </div>
                                                        <span>$118.1K</span>
                                                    </li>
                                                    <li className=" w-full flex justify-between items-center text-slate-600-default py-2 space-x-3 truncate">
                                                        <div className="flex space-x-2.5 truncate px-2 py-1">
                        <span
                            className="bg-cyan-500 w-1 shrink-0 rounded-sm"
                            aria-hidden="true"
                        />
                                                            <span className="truncate">ETF Shares Vital</span>
                                                        </div>
                                                        <span>$90.3K</span>
                                                    </li>
                                                    <li className=" w-full flex justify-between items-center text-slate-600-default py-2 space-x-3 truncate">
                                                        <div className="flex space-x-2.5 truncate px-2 py-1">
                        <span
                            className="bg-fuchsia-500 w-1 shrink-0 rounded-sm"
                            aria-hidden="true"
                        />
                                                            <span className="truncate">iShares Tech Growth</span>
                                                        </div>
                                                        <span>$120.1K</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                List and Tables
                                            </p>
                                            <p className="mt-1 leading-7 text-slate-500">
                                                Modular lists and tables that go along with badges, icons, or
                                                visualization elements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full md:col-span-6 lg:col-span-5">
                                <div className="shadow-slate-600 h-full rounded-xl">
                                    <div
                                        className="z-10 h-full overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="h-full overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div>
                                                <div className="space-y-4">
                                                    <div>
                      <span className="text-slate-600-default text-slate-600-content">
                        Datepicker
                      </span>
                                                        <div
                                                            className="min-w-[10rem] relative flex justify-between text-slate-600-default shadow-slate-600-input dark:shadow-dark-slate-600-input rounded-slate-600-default mt-2 w-full max-w-none">
                                                            <div
                                                                className="w-full rounded-slate-600-default"
                                                                data-headlessui-state=""
                                                            >
                                                                <div className="relative w-full">
                                                                    <button
                                                                        className="w-full outline-none text-left whitespace-nowrap truncate focus:ring-2 transition duration-100 rounded-l-slate-600-default flex flex-nowrap border pl-3 py-2 rounded-l-slate-600-default focus:border-slate-600-brand-subtle focus:ring-slate-600-brand-muted dark:focus:border-dark-slate-600-brand-subtle dark:focus:ring-dark-slate-600-brand-muted rounded-slate-600-default pr-8 bg-slate-600-background dark:bg-dark-slate-600-background hover:bg-slate-600-background-muted dark:hover:bg-dark-slate-600-background-muted text-slate-600-content dark:text-dark-slate-600-content border-slate-600-border dark:border-dark-slate-600-border"
                                                                        type="button"
                                                                        aria-expanded="false"
                                                                        data-headlessui-state=""
                                                                        id="headlessui-popover-button-:r3:"
                                                                    >
                                                                        <svg
                                                                            className=" flex-none shrink-0 h-5 w-5 -ml-0.5 mr-2 text-slate-600-content-subtle dark:text-dark-slate-600-content-subtle"
                                                                            aria-hidden="true"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                        <p className="truncate">Select range</p>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    position: "fixed",
                                                                    top: 1,
                                                                    left: 1,
                                                                    width: 1,
                                                                    height: 0,
                                                                    padding: 0,
                                                                    margin: "-1px",
                                                                    overflow: "hidden",
                                                                    clip: "rect(0px, 0px, 0px, 0px)",
                                                                    whiteSpace: "nowrap",
                                                                    borderWidth: 0,
                                                                    display: "none"
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="multi-select"
                                                            className="text-slate-600-default text-slate-600-content"
                                                        >
                                                            Multi Select
                                                        </label>
                                                        <div
                                                            className="w-full min-w-[10rem] text-slate-600-default mt-2">
                                                            <div className="relative">
                                                                <select
                                                                    title="multi-select-hidden"
                                                                    className="h-full w-full absolute left-0 top-0 -z-10 opacity-0"
                                                                    id="multi-select"
                                                                >
                                                                    <option
                                                                        className="hidden"
                                                                        value=""
                                                                    >
                                                                        Select...
                                                                    </option>
                                                                    <option className="hidden" value={1}>
                                                                        Trail running
                                                                    </option>
                                                                    <option className="hidden" value={2}>
                                                                        Paddle tennis
                                                                    </option>
                                                                    <option className="hidden" value={3}>
                                                                        Alpine skiing
                                                                    </option>
                                                                </select>
                                                                <div id="multi-select" data-headlessui-state="">
                                                                    <button
                                                                        className="w-full outline-none text-left whitespace-nowrap truncate rounded-slate-600-default focus:ring-2 transition duration-100 border pr-8 py-1.5 shadow-slate-600-input focus:border-slate-600-brand-subtle focus:ring-slate-600-brand-muted dark:shadow-dark-slate-600-input dark:focus:border-dark-slate-600-brand-subtle dark:focus:ring-dark-slate-600-brand-muted pl-3 bg-slate-600-background dark:bg-dark-slate-600-background hover:bg-slate-600-background-muted dark:hover:bg-dark-slate-600-background-muted text-slate-600-content dark:text-dark-slate-600-content border-slate-600-border dark:border-dark-slate-600-border"
                                                                        id="headlessui-listbox-button-:r5:"
                                                                        type="button"
                                                                        aria-haspopup="listbox"
                                                                        aria-expanded="false"
                                                                        data-headlessui-state=""
                                                                    >
                                                                        <div className="h-6 flex items-center">
                                                                            <span>Select...</span>
                                                                        </div>
                                                                        <span
                                                                            className="absolute inset-y-0 right-0 flex items-center mr-2.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className=" flex-none h-5 w-5 text-slate-600-content-subtle dark:text-dark-slate-600-content-subtle"
                                >
                                  <path
                                      d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"/>
                                </svg>
                              </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="number-input"
                                                            className="text-slate-600-default text-slate-600-content"
                                                        >
                                                            Number input
                                                        </label>
                                                        <div
                                                            className=" relative w-full flex items-center min-w-[10rem] outline-none rounded-slate-600-default transition duration-100 border shadow-slate-600-input dark:shadow-dark-slate-600-input bg-slate-600-background dark:bg-dark-slate-600-background hover:bg-slate-600-background-muted dark:hover:bg-dark-slate-600-background-muted text-slate-600-content dark:text-dark-slate-600-content border-slate-600-border dark:border-dark-slate-600-border mt-2">
                                                            <input
                                                                className=" w-full bg-transparent focus:outline-none focus:ring-0 border-none text-slate-600-default rounded-slate-600-default transition duration-100 py-2 text-slate-600-content-emphasis dark:text-dark-slate-600-content-emphasis [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-3 pl-3 placeholder:text-slate-600-content dark:placeholder:text-dark-slate-600-content"
                                                                placeholder="Type..."
                                                                data-testid="base-input"
                                                                id="number-input"
                                                                type="number"
                                                            />
                                                            <div className="flex justify-center align-middle">
                                                                <div
                                                                    tabIndex={-1}
                                                                    className="cursor-pointer hover:text-slate-600-content dark:hover:text-dark-slate-600-content flex mx-auto text-slate-600-content-subtle dark:text-dark-slate-600-content-subtle group py-[10px] px-2.5 border-l border-slate-600-border dark:border-dark-slate-600-border"
                                                                >
                                                                    <svg
                                                                        data-testid="step-down"
                                                                        className=" h-4 w-4 duration-75 transition group-active:scale-95"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2.5"
                                                                    >
                                                                        <path d="M20 12H4"/>
                                                                    </svg>
                                                                </div>
                                                                <div
                                                                    tabIndex={-1}
                                                                    className="cursor-pointer hover:text-slate-600-content dark:hover:text-dark-slate-600-content flex mx-auto text-slate-600-content-subtle dark:text-dark-slate-600-content-subtle group py-[10px] px-2.5 border-l border-slate-600-border dark:border-dark-slate-600-border"
                                                                >
                                                                    <svg
                                                                        data-testid="step-up"
                                                                        className=" h-4 w-4 duration-75 transition group-active:scale-95"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2.5"
                                                                    >
                                                                        <path d="M12 4v16m8-8H4"/>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="text-input"
                                                            className="text-slate-600-default text-slate-600-content"
                                                        >
                                                            Text input
                                                        </label>
                                                        <div
                                                            className=" relative w-full flex items-center min-w-[10rem] outline-none rounded-slate-600-default transition duration-100 border shadow-slate-600-input dark:shadow-dark-slate-600-input bg-slate-600-background dark:bg-dark-slate-600-background hover:bg-slate-600-background-muted dark:hover:bg-dark-slate-600-background-muted text-slate-600-content dark:text-dark-slate-600-content border-slate-600-border dark:border-dark-slate-600-border mt-2">
                                                            <input
                                                                className=" w-full bg-transparent focus:outline-none focus:ring-0 border-none text-slate-600-default rounded-slate-600-default transition duration-100 py-2 text-slate-600-content-emphasis dark:text-dark-slate-600-content-emphasis [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-3 pl-3 placeholder:text-slate-600-content dark:placeholder:text-dark-slate-600-content"
                                                                placeholder="Search..."
                                                                data-testid="base-input"
                                                                id="text-input"
                                                                type="text"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                    Inputs
                                                </p>
                                                <p className="mt-1 leading-7 text-slate-500">
                                                    Powerful filter components for better interaction with your
                                                    data, with full support for keyboard navigation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full lg:col-span-7">
                                <div className="shadow-slate-600 rounded-xl">
                                    <div
                                        className="z-10 overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div>
                                                <div
                                                    className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand rounded-slate-600-small ring-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={24}
                                                                height={24}
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                                className="remixicon h-5 w-5 shrink-0 text-blue-500"
                                                            >
                                                                <path
                                                                    d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17421 10.3431L6.75999 11.7574L11.0026 16Z"/>
                                                            </svg>
                                                            <p className="text-slate-600-default font-medium text-slate-600-content-strong">
                                                                example.com
                                                            </p>
                                                        </div>
                                                        <p className="text-slate-600-default text-slate-600-content">
                                                            99.9% uptime
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 flex gap-[1.5px]">
                                                        <div
                                                            className=" h-10 items-center space-x-0.5 hidden w-full sm:flex">
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                        </div>
                                                        <div
                                                            className=" h-10 flex items-center space-x-0.5 w-full sm:hidden">
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-gray-300 dark:bg-gray-300"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                            <div
                                                                className=" w-full h-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px] bg-blue-500 dark:bg-blue-500"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                    Advanced visualizations
                                                </p>
                                                <p className="mt-1 leading-7 text-slate-500">
                                                    Tracker, Bar Lists, and many more components to visualize
                                                    complex use cases gracefully.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="shadow-slate-600 mt-6 rounded-xl">
                                    <div
                                        className="z-10 overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div>
                                                <div className="space-y-6">
                                                    <div className="flex flex-wrap items-center gap-4">
                      <span
                          className="inline-flex items-center gap-x-1 rounded-slate-600-full bg-blue-50 px-2.5 py-1 text-slate-600-label font-semibold text-blue-600 ring-1 ring-blue-500/20">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon -ml-0.5 h-4 w-4"
                        >
                          <path d="M12 8L18 14H6L12 8Z"/>
                        </svg>
                        9.3%
                      </span>
                                                        <span
                                                            className="inline-flex items-center gap-x-1 rounded-slate-600-full bg-blue-50 px-2.5 py-1 text-slate-600-label font-semibold text-blue-600 ring-1 ring-blue-500/20">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon -ml-0.5 h-4 w-4"
                        >
                          <path d="M12 16L6 10H18L12 16Z"/>
                        </svg>
                        1.9%
                      </span>
                                                        <span
                                                            className="inline-flex items-center gap-x-1 rounded-slate-600-full bg-blue-50 px-2.5 py-1 text-slate-600-label font-semibold text-blue-600 ring-1 ring-blue-500/20">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon -ml-0.5 h-4 w-4"
                        >
                          <path d="M16 12L10 18V6L16 12Z"/>
                        </svg>
                        0.6%
                      </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-6">
                      <span className="flex items-center justify-center rounded-lg bg-blue-500 p-3 shadow">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon h-5 w-5 shrink-0 text-white"
                        >
                          <path
                              d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19Z"/>
                        </svg>
                      </span>
                                                        <span
                                                            className="flex items-center justify-center rounded-lg bg-blue-500 p-3 shadow">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon h-5 w-5 shrink-0 text-white"
                        >
                          <path
                              d="M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"/>
                        </svg>
                      </span>
                                                        <span
                                                            className="flex items-center justify-center rounded-lg bg-blue-500 p-3 shadow">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon h-5 w-5 shrink-0 text-white"
                        >
                          <path
                              d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"/>
                        </svg>
                      </span>
                                                        <span
                                                            className="flex items-center justify-center rounded-lg bg-blue-500 p-3 shadow">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon h-5 w-5 shrink-0 text-white"
                        >
                          <path
                              d="M20.0834 15.1999L21.2855 15.9212C21.5223 16.0633 21.599 16.3704 21.457 16.6072C21.4147 16.6776 21.3559 16.7365 21.2855 16.7787L12.5145 22.0412C12.1979 22.2313 11.8022 22.2313 11.4856 22.0412L2.71463 16.7787C2.47784 16.6366 2.40106 16.3295 2.54313 16.0927C2.58536 16.0223 2.64425 15.9634 2.71463 15.9212L3.91672 15.1999L12.0001 20.0499L20.0834 15.1999ZM20.0834 10.4999L21.2855 11.2212C21.5223 11.3633 21.599 11.6704 21.457 11.9072C21.4147 11.9776 21.3559 12.0365 21.2855 12.0787L12.0001 17.6499L2.71463 12.0787C2.47784 11.9366 2.40106 11.6295 2.54313 11.3927C2.58536 11.3223 2.64425 11.2634 2.71463 11.2212L3.91672 10.4999L12.0001 15.3499L20.0834 10.4999ZM12.5145 1.30864L21.2855 6.5712C21.5223 6.71327 21.599 7.0204 21.457 7.25719C21.4147 7.32757 21.3559 7.38647 21.2855 7.42869L12.0001 12.9999L2.71463 7.42869C2.47784 7.28662 2.40106 6.97949 2.54313 6.7427C2.58536 6.67232 2.64425 6.61343 2.71463 6.5712L11.4856 1.30864C11.8022 1.11864 12.1979 1.11864 12.5145 1.30864ZM12.0001 3.33233L5.88735 6.99995L12.0001 10.6676L18.1128 6.99995L12.0001 3.33233Z"/>
                        </svg>
                      </span>
                                                        <span
                                                            className="hidden items-center justify-center rounded-lg bg-blue-500 p-3 shadow sm:flex">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="currentColor"
                            aria-hidden="true"
                            className="remixicon h-5 w-5 shrink-0 text-white"
                        >
                          <path
                              d="M8 3C4.13401 3 1 6.13401 1 10C1 13.866 4.13401 17 8 17H9.07089C9.02417 16.6734 9 16.3395 9 16C9 15.6605 9.02417 15.3266 9.07089 15H8C5.23858 15 3 12.7614 3 10C3 7.23858 5.23858 5 8 5H16C18.7614 5 21 7.23858 21 10C21 10.3428 20.9655 10.6775 20.8998 11.0008C21.4853 11.5748 21.9704 12.2508 22.3264 13C22.7583 12.0907 23 11.0736 23 10C23 6.13401 19.866 3 16 3H8ZM16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13ZM11 16C11 13.2386 13.2386 11 16 11C18.7614 11 21 13.2386 21 16C21 17.0191 20.6951 17.967 20.1716 18.7574L22.7071 21.2929L21.2929 22.7071L18.7574 20.1716C17.967 20.6951 17.0191 21 16 21C13.2386 21 11 18.7614 11 16Z"/>
                        </svg>
                      </span>
                                                    </div>
                                                    <div className="gap flex flex-wrap">
                                                        <div className=" w-full">
                                                            <div
                                                                className=" justify-start overflow-x-clip inline-flex p-0.5 rounded-slate-600-default space-x-1.5 bg-slate-600-background-subtle dark:bg-dark-slate-600-background-subtle w-full"
                                                                role="tablist"
                                                                aria-orientation="horizontal"
                                                            >
                                                                <button
                                                                    className=" flex whitespace-nowrap truncate max-w-xs outline-none ui-focus-visible:ring text-slate-600-default transition duration-100 border-transparent border rounded-slate-600-small px-2.5 py-1 ui-selected:border-slate-600-border ui-selected:bg-slate-600-background ui-selected:shadow-slate-600-input ui-not-selected:hover:text-slate-600-content-emphasis ui-not-selected:text-slate-600-content dark:ui-selected:border-dark-slate-600-border dark:ui-selected:bg-dark-slate-600-background dark:ui-selected:shadow-dark-slate-600-input dark:ui-not-selected:hover:text-dark-slate-600-content-emphasis dark:ui-not-selected:text-dark-slate-600-content ui-selected:text-blue-500 dark:ui-selected:text-blue-500 w-full justify-center font-medium"
                                                                    id="headlessui-tabs-tab-:r5g:"
                                                                    role="tab"
                                                                    type="button"
                                                                    aria-selected="true"
                                                                    tabIndex={0}
                                                                    data-headlessui-state="selected"
                                                                >
                                                                    <span>Overview</span>
                                                                </button>
                                                                <button
                                                                    className=" flex whitespace-nowrap truncate max-w-xs outline-none ui-focus-visible:ring text-slate-600-default transition duration-100 border-transparent border rounded-slate-600-small px-2.5 py-1 ui-selected:border-slate-600-border ui-selected:bg-slate-600-background ui-selected:shadow-slate-600-input ui-not-selected:hover:text-slate-600-content-emphasis ui-not-selected:text-slate-600-content dark:ui-selected:border-dark-slate-600-border dark:ui-selected:bg-dark-slate-600-background dark:ui-selected:shadow-dark-slate-600-input dark:ui-not-selected:hover:text-dark-slate-600-content-emphasis dark:ui-not-selected:text-dark-slate-600-content ui-selected:text-blue-500 dark:ui-selected:text-blue-500 w-full justify-center font-medium"
                                                                    id="headlessui-tabs-tab-:r5h:"
                                                                    role="tab"
                                                                    type="button"
                                                                    aria-selected="false"
                                                                    tabIndex={-1}
                                                                    data-headlessui-state=""
                                                                >
                                                                    <span>Report</span>
                                                                </button>
                                                                <button
                                                                    className=" flex whitespace-nowrap truncate max-w-xs outline-none ui-focus-visible:ring text-slate-600-default transition duration-100 border-transparent border rounded-slate-600-small px-2.5 py-1 ui-selected:border-slate-600-border ui-selected:bg-slate-600-background ui-selected:shadow-slate-600-input ui-not-selected:hover:text-slate-600-content-emphasis ui-not-selected:text-slate-600-content dark:ui-selected:border-dark-slate-600-border dark:ui-selected:bg-dark-slate-600-background dark:ui-selected:shadow-dark-slate-600-input dark:ui-not-selected:hover:text-dark-slate-600-content-emphasis dark:ui-not-selected:text-dark-slate-600-content ui-selected:text-blue-500 dark:ui-selected:text-blue-500 w-full justify-center font-medium"
                                                                    id="headlessui-tabs-tab-:r5i:"
                                                                    role="tab"
                                                                    type="button"
                                                                    aria-selected="false"
                                                                    tabIndex={-1}
                                                                    data-headlessui-state=""
                                                                >
                                                                    <span>Forecast</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                    Badges, Icons and many more UI elements
                                                </p>
                                                <p className="mt-1 leading-7 text-slate-500">
                                                    All the necessary components to complement analytical
                                                    interfaces.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full">
                                <div className="shadow-slate-600 rounded-xl">
                                    <div
                                        className="z-10 h-full overflow-hidden rounded-xl bg-slate-50/40 p-1.5 ring-1 ring-inset ring-slate-200/50">
                                        <div
                                            className="overflow-hidden rounded-md bg-white p-8 shadow-2xl shadow-black/5 ring-1 ring-slate-900/5">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                <div
                                                    className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand hidden flex-col justify-between rounded-slate-600-small ring-slate-200 sm:flex">
                                                    <div>
                                                        <p className="text-slate-600-default text-slate-600-content">
                                                            Storage used
                                                        </p>
                                                        <p className="text-slate-600-title font-semibold text-slate-600-content-strong">
                                                            1.85GB
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="mt-2 flex items-center justify-between text-slate-600-default text-slate-600-content">
                                                            <span>18.5%</span>
                                                            <span>1.85 of 10GB</span>
                                                        </p>
                                                        <div
                                                            className=" flex items-center w-full mt-2">
                                                            <div
                                                                className=" relative flex items-center w-full rounded-slate-600-full bg-opacity-20 h-2 bg-slate-600-brand-muted/50 dark:bg-dark-slate-600-brand-muted">
                                                                <div
                                                                    className=" flex-col h-full rounded-slate-600-full bg-slate-600-brand dark:bg-dark-slate-600-brand"
                                                                    style={{ width: "18.5%" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand hidden rounded-slate-600-small ring-slate-200 sm:block">
                                                    <p className="text-slate-600-default text-slate-600-content">
                                                        Acme Holding
                                                    </p>
                                                    <div className="flex items-baseline justify-between">
                                                        <p className="text-slate-600-title font-semibold text-slate-600-content-strong">
                                                            $45.1K
                                                        </p>
                                                        <p className="flex items-center space-x-1 text-slate-600-default">
                        <span className="font-medium text-slate-600-content-strong">
                          +$1.1K
                        </span>
                                                            <span className="text-slate-600-content">+9.1%</span>
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 h-10 w-full">
                                                        <div
                                                            className="recharts-responsive-container h-full w-full"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                minWidth: 0
                                                            }}
                                                        >
                                                            <div
                                                                className="recharts-wrapper"
                                                                style={{
                                                                    position: "relative",
                                                                    cursor: "default",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    maxHeight: 40,
                                                                    maxWidth: 550
                                                                }}
                                                            >
                                                                <svg
                                                                    className="recharts-surface"
                                                                    width={550}
                                                                    height={40}
                                                                    viewBox="0 0 550 40"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%"
                                                                    }}
                                                                >
                                                                    <title/>
                                                                    <desc/>
                                                                    <defs>
                                                                        <clipPath id="recharts50-clip">
                                                                            <rect x={1} y={1} height={38} width={548}/>
                                                                        </clipPath>
                                                                    </defs>
                                                                    <defs>
                                                                        <linearGradient
                                                                            className="text-blue-500 dark:text-blue-500"
                                                                            id="blue"
                                                                            x1={0}
                                                                            y1={0}
                                                                            x2={0}
                                                                            y2={1}
                                                                        >
                                                                            <stop
                                                                                stopColor="currentColor"
                                                                                stopOpacity="0.3"
                                                                            />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <g className="recharts-layer recharts-area stroke-blue-500 dark:stroke-blue-500">
                                                                        <g className="recharts-layer">
                                                                            <path
                                                                                className="recharts-curve recharts-area-area"
                                                                                strokeOpacity={1}
                                                                                name="Revenue"
                                                                                fill="url(#blue)"
                                                                                strokeWidth={2}
                                                                                strokeLinejoin="round"
                                                                                strokeLinecap="round"
                                                                                fillOpacity="0.6"
                                                                                width={548}
                                                                                height={38}
                                                                                stroke="none"
                                                                                d="M1,22.961L40.143,27.451L79.286,25.513L118.429,23.504L157.571,20.214L196.714,19.308L235.857,28.238L275,25.868L314.143,22.959L353.286,17.256L392.429,17.818L431.571,17.326L470.714,14.772L509.857,12.028L549,3.959L549,39L509.857,39L470.714,39L431.571,39L392.429,39L353.286,39L314.143,39L275,39L235.857,39L196.714,39L157.571,39L118.429,39L79.286,39L40.143,39L1,39Z"
                                                                            />
                                                                            <path
                                                                                className="recharts-curve recharts-area-curve"
                                                                                strokeOpacity={1}
                                                                                name="Revenue"
                                                                                stroke=""
                                                                                fill="none"
                                                                                strokeWidth={2}
                                                                                strokeLinejoin="round"
                                                                                strokeLinecap="round"
                                                                                fillOpacity="0.6"
                                                                                width={548}
                                                                                height={38}
                                                                                d="M1,22.961L40.143,27.451L79.286,25.513L118.429,23.504L157.571,20.214L196.714,19.308L235.857,28.238L275,25.868L314.143,22.959L353.286,17.256L392.429,17.818L431.571,17.326L470.714,14.772L509.857,12.028L549,3.959"
                                                                            />
                                                                        </g>
                                                                    </g>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className=" relative w-full text-left ring-1 p-6 bg-slate-600-background shadow-slate-600-card dark:bg-dark-slate-600-background dark:ring-dark-slate-600-ring dark:shadow-dark-slate-600-card border-slate-600-brand dark:border-dark-slate-600-brand flex items-center justify-center rounded-slate-600-small ring-slate-200">
                                                    <div className="flex items-center space-x-5">
                                                        <div
                                                            className=" flex flex-col items-center justify-center">
                                                            <svg
                                                                width={60}
                                                                height={60}
                                                                viewBox="0 0 60 60"
                                                                className="transform -rotate-90"
                                                            >
                                                                <circle
                                                                    r={27}
                                                                    cx={30}
                                                                    cy={30}
                                                                    strokeWidth={6}
                                                                    fill="transparent"
                                                                    stroke=""
                                                                    strokeLinecap="round"
                                                                    className="transition-colors ease-linear stroke-slate-600-brand-muted/50 dark:stroke-dark-slate-600-brand-muted"
                                                                />
                                                                <circle
                                                                    r={27}
                                                                    cx={30}
                                                                    cy={30}
                                                                    strokeWidth={6}
                                                                    strokeDasharray="169.64600329384882 169.64600329384882"
                                                                    strokeDashoffset="135.71680263507906"
                                                                    fill="transparent"
                                                                    stroke=""
                                                                    strokeLinecap="round"
                                                                    className="stroke-slate-600-brand dark:stroke-dark-slate-600-brand transition-all duration-300 ease-in-out"
                                                                />
                                                            </svg>
                                                            <div className="absolute flex">
                          <span
                              className="text-slate-600-label font-medium text-slate-600-content-strong dark:text-dark-slate-600-content-strong">
                            20%
                          </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600-default font-medium text-slate-600-content-strong dark:text-dark-slate-600-content-strong">
                                                                Data Workspaces
                                                            </p>
                                                            <p className="text-slate-600-default text-slate-600-content dark:text-dark-slate-600-content">
                                                                1 of 5 used
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-6 text-lg font-semibold text-slate-600-content-strong">
                                                Data Bars, Spark Charts, and Progress Circles
                                            </p>
                                            <p className="mt-1 leading-7 text-slate-500">
                                                Micro visualizations to highlight even the smallest details
                                                better.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
                <div className="mx-auto max-w-7xl px-4 lg:px-8 overflow-hidde mt-14 sm:mt-28">
                    <section
                        id="tweets"
                        className="relative mb-40 mt-0 scroll-mt-24 focus:outline-none "
                    >
                        <div className="mx-auto flex items-center justify-start space-x-2 text-blue-500">
        <span className="font-semibold tracking-tight text-blue-500">
          Customer voices on
        </span>
                            <svg
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                fill="currentColor"
                                aria-hidden="true"
                                className="remixicon h-5 w-5 shrink-0"
                            >
                                <path
                                    d="M18.2048 2.25H21.5128L14.2858 10.51L22.7878 21.75H16.1308L10.9168 14.933L4.95084 21.75H1.64084L9.37084 12.915L1.21484 2.25H8.04084L12.7538 8.481L18.2048 2.25ZM17.0438 19.77H18.8768L7.04484 4.126H5.07784L17.0438 19.77Z"/>
                            </svg>
                        </div>
                        <h2 className="mt-4 max-w-3xl text-left text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Leading developers build with FireCMS UI
                        </h2>
                        <div
                            className="relative mt-14 grid grid-cols-1 gap-6 overflow-hidden px-0.5 pt-2 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                            <ul className="hidden space-y-6 sm:block">
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                FireCMS UI makes it so easy to build beautiful dashboards. The
                                                ReactJS / Next.js ecosystem just keeps getting better and
                                                better.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fgrauch.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fgrauch.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fgrauch.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/rauchg/status/1579505020911095808"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Guillermo Rauch{" "}
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">CEO @ Vercel</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p> tremor.so is dope</p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fpeer.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fpeer.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fpeer.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/peer_rich/status/1641034691577774080?s=20"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Peer Richelsen
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Co-CEO @ Cal.com
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                Made quite some progress in the last week. Huge thanks
                                                @tremorlabs for saving me weeks of creating custom components.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Feyk.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Feyk.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Feyk.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/thoughtsofeyk/status/1598033326396346402"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Eyk Rehbein
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Senior Software Engineer @ Sonic
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                I mostly hate React with burning passion, but then there are
                                                tools like this that the Vue ecosystem just doesn't have...
                                                alas.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fptsipman.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fptsipman.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fptsipman.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/ptsi/status/1579727950957940736"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Philipp Tsipman
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Founder @ Creative Change
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                Love this idea of a utility-focused design system. Really hits
                                                the core of what a good design system should be— specialized
                                                components for your specific product. No reason to reinvent
                                                the wheel! Excited to incorporate FireCMS UI into BarHop's admin
                                                site
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fmcarbone.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fmcarbone.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fmcarbone.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/MikeCarbone/status/1579616173347307520"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Mike Carbone
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Software Engineer @ Newsela
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                OMG I just saw tremor.so for the first time and it will be a
                                                GIANT HELP from now on
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fenegri.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fenegri.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fenegri.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/NegriEmiliano/status/1586493055905181696"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Emiliano Negri
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Software Engineer
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                FireCMS UI is going to take over. Intuitive, easy to use, and
                                                clean design. Lastest v2 release is fire.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fmarcard.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fmarcard.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fmarcard.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/Marcard/status/1635780254579978241"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Marc Anthony Card
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    VP of Product Technology &amp; Integrations
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-4 text-slate-700">
                                            <p>
                                                {" "}
                                                FireCMS UI is the kind of library I prefer when creating tools,
                                                tbh. Just like Shopify Polaris, I don't want to think about
                                                styling, but just calling components, maybe change the color
                                                theme and start building
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fkinngh.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fkinngh.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fkinngh.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/kinngh/status/1635336936121569281"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Harshdeep Singh Hura
                                                    </a>
                                                </div>
                                                <span className="text-sm text-slate-500">
                    Ecommerce consultant
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                            </ul>
                            <ul className="hidden space-y-6 sm:block">
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                I am in love with the @tremorlabs viz library &amp; we've been
                                                working to adopt it in our Starter Kits. Today we merged the
                                                migration to FireCMS UI in our Web Analytics Starter Kit. It's
                                                beautiful!
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Falasdair.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Falasdair.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Falasdair.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/sdairs/status/1602656992996229121"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Alasdair Brown
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">DevRel Lead @ Tinybird</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Love how clean the dashboard library from @tremorlabs is.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Famorris.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Famorris.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Famorris.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/amorriscode/status/1579485765129883649?s=20&t=P1zuNo5Cm-wqjX8g6yEc0A"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Anthony Morris
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Senior Software Engineer @ Stripe
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p> Creating dashboards quickly with @tremorlabs</p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fdbredvick.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fdbredvick.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fdbredvick.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/DBredvick/status/1608603533011750912"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Drew Bredvick
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Sales Engineering Manager @ Vercel
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                ... If anyone else is looking for a super clean dashboard
                                                library then @tremorlabs have done an amazing job!
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fmbell.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fmbell.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fmbell.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/de_bug_dev/status/1579630284232089600"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Michael Bell
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Software Engineer</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                FireCMS UI looks interesting. Cool React components to build
                                                dashboards tremor.so
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Ffcopes.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Ffcopes.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Ffcopes.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/flaviocopes/status/1622500698280566784"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Flavio Copes
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Creator of Bootcamp.dev
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Fantastic set of UI modular components @tremorlabs to build
                                                dashboards with React. It comes with pre-built modular KPI
                                                cards.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fabaranovskij.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fabaranovskij.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fabaranovskij.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/andrejusb/status/1633846149806444551"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Andrej Baranovskij
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Full-Stack Engineer @ Katanaml.io
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Using http://tremor.so for some dashboards for a project and
                                                they're coming out pretty nice.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fdeepwhitman.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fdeepwhitman.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fdeepwhitman.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/deepwhitman/status/1632638865415749635"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Bilal Tahir
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Front-end Engineer</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Just found http://tremor.so, didn't think I needed charts in
                                                the portal that I'm building but now I think they would be
                                                awesome.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fcarterwmckay.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fcarterwmckay.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fcarterwmckay.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/carterwmckay/status/1635475430550405121"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Carter McKay
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Data and Web Engineer</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                            </ul>
                            <ul className="hidden space-y-6 lg:block">
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p> This is a game changer for anyone using @tailwindcss!</p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Frbodley.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Frbodley.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Frbodley.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/RobertBodley/status/1579598588384268288"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Robert Bodley
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Software Engineer @ Amazon
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                It is a solid 10/10 for me and I am sure this project will
                                                take over the dashboarding business in the upcoming months!
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Faugustyns.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Faugustyns.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Faugustyns.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://javascript.plainenglish.io/the-easiest-way-to-build-dashboards-in-react-83bf44d1c981"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Dries Augustyns
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Founder @ useplunk</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                We've loved working with the @tremorlabs team and contributing
                                                to the project. It's moving fast and they're releasing really
                                                meaningful changes. We expect to continue working with FireCMS UI
                                                on additional starter kits like this one.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fbird.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fbird.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fbird.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/tinybirdco/status/1602716862818697216"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Tinybird
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Tinybird is the real-time platform for data and engineering
                    teams
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p> Nice! I recently stumbled upon FireCMS UI. Great job!</p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fmpociot.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fmpociot.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fmpociot.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/marcelpociot/status/1576563818775257088"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Marcel Pociot
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">CTO @ Beyond Code</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Great sample implementations on their Blocks page, uses
                                                Tailwind for styling, Recharts internally for charts and has a
                                                steady set of updates and attention to detail.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fjschuur.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fjschuur.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fjschuur.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/joostschuur/status/1622537748706910209"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Joost Schuur
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    JavaScript Developer @ Playmob
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                I was definitely hand-rolling all my own components. Which
                                                feels more and more dumb the more I view this library :)
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fcpennington.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fcpennington.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fcpennington.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/cpenned/status/1622765904177111040"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Chris Pennington
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Creator of Coding in Public
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                I was immediately sold out when I've found out about
                                                Datepicker, Select and Toggle components. Something I
                                                desperately needed and I've struggled to find a good and easy
                                                implementation using @tailwindcss You guys simply nailed it!
                                                Every single component is just perfect
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fbesfortoruci.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fbesfortoruci.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fbesfortoruci.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/BesfortOruci/status/1635073597659316226"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Besfort Oruci
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Software Developer</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Super excited to see the FireCMS UI release, Looking forward to
                                                using it in my side projects and maybe internally at
                                                Mentimeter :) it looks fantastic
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fgdearns.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fgdearns.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fgdearns.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/geordidearns"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Geordi Dearns
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Engineering Manager @ Mentimeter
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                            </ul>
                            <ul className="space-y-6 sm:hidden">
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                FireCMS UI makes it so easy to build beautiful dashboards. The
                                                ReactJS / Next.js ecosystem just keeps getting better and
                                                better.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fgrauch.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fgrauch.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fgrauch.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/rauchg/status/1579505020911095808"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Guillermo Rauch{" "}
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">CEO @ Vercel</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Super excited to see the FireCMS UI release, Looking forward to
                                                using it in my side projects and maybe internally at
                                                Mentimeter :) it looks fantastic
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fgdearns.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fgdearns.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fgdearns.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/geordidearns"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Geordi Dearns
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Engineering Manager @ Mentimeter
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                It is a solid 10/10 for me and I am sure this project will
                                                take over the dashboarding business in the upcoming months!
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Faugustyns.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Faugustyns.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Faugustyns.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://javascript.plainenglish.io/the-easiest-way-to-build-dashboards-in-react-83bf44d1c981"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Dries Augustyns
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">Founder @ useplunk</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                I am in love with the @tremorlabs viz library &amp; we've been
                                                working to adopt it in our Starter Kits. Today we merged the
                                                migration to FireCMS UI in our Web Analytics Starter Kit. It's
                                                beautiful 😍
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Falasdair.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Falasdair.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Falasdair.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/sdairs/status/1602656992996229121"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Alasdair Brown
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">DevRel Lead @ Tinybird</span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p> Creating dashboards quickly with @tremorlabs</p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Fdbredvick.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Fdbredvick.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Fdbredvick.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/DBredvick/status/1608603533011750912"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Drew Bredvick
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Sales Engineering Manager @ Vercel
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                                <li className="text-sm leading-6">
                                    <figure
                                        className="hover:shadow-slate-600 relative flex flex-col-reverse rounded-lg border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5">
                                        <blockquote className="mt-6 text-slate-700">
                                            <p>
                                                {" "}
                                                Love how clean the dashboard library from @tremorlabs is.
                                            </p>
                                        </blockquote>
                                        <figcaption className="flex items-center space-x-4">
                                            <img
                                                alt=""
                                                loading="lazy"
                                                width={50}
                                                height={50}
                                                decoding="async"
                                                data-nimg={1}
                                                className="h-11 w-11 flex-none rounded-full object-cover"
                                                srcSet="/_next/image?url=%2Favatars%2Famorris.png&w=64&q=75 1x, /_next/image?url=%2Favatars%2Famorris.png&w=128&q=75 2x"
                                                src="/_next/image?url=%2Favatars%2Famorris.png&w=128&q=75"
                                                style={{ color: "transparent" }}
                                            />
                                            <div className="flex-auto">
                                                <div className="text-sm font-medium text-slate-900">
                                                    <a
                                                        href="https://twitter.com/amorriscode/status/1579485765129883649?s=20&t=P1zuNo5Cm-wqjX8g6yEc0A"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="absolute inset-0"/>
                                                        Anthony Morris
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">
                    Senior Software Engineer @ Stripe
                  </span>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </li>
                            </ul>
                        </div>
                        <a className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-white pb-8 pt-12">
                            <button
                                className="inline-flex w-fit cursor-pointer items-center justify-center rounded-md sm:text-sm font-medium disabled:pointer-events-none disabled:opacity-60 transition-all ease-in-out focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 relative group bg-gradient-to-b hover:opacity-90 active:scale-[99%] duration-200 shadow-sm pointer-events-auto from-slate-800 to-slate-900 px-3.5 py-2.5 text-white hover:from-slate-700 hover:to-slate-800"
                                type="button"
                            >
                                Show less
                            </button>
                        </a>
                    </section>
                    <section className="gradient-to-b from-transparent to-slate-50">
                        <h3 className="font-semibold tracking-tight text-blue-500">
                            Ship faster with Tailwind CSS
                        </h3>
                        <h2 className="mt-4 max-w-3xl text-left text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            A fully customizable component library that is growing quickly
                        </h2>
                        <ul
                            role="list"
                            className="mt-14 grid grid-cols-1 gap-x-6 gap-y-8 sm:mt-16 md:grid-cols-3"
                        >
                            <li aria-label="NPM Link" className="relative">
                                <a
                                    href="https://www.npmjs.com/package/@tremor/react"
                                    className="focus:outline-none"
                                    target="_blank"
                                    rel="noreferrer"
                                >
            <span
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-red-600"
                  aria-hidden="true"
              >
                <path
                    d="M20.001 3C20.5533 3 21.001 3.44772 21.001 4V20C21.001 20.5523 20.5533 21 20.001 21H4.00098C3.44869 21 3.00098 20.5523 3.00098 20V4C3.00098 3.44772 3.44869 3 4.00098 3H20.001ZM19.001 5H5.00098V19H19.001V5ZM17.001 7V17H14.501V9.5H12.001V17H7.00098V7H17.001Z"/>
              </svg>
            </span>
                                </a>
                                <h3 className="mt-4 w-fit text-clip bg-gradient-to-t from-slate-900 to-slate-700 bg-clip-text text-4xl font-bold text-transparent">
                                    280K+
                                </h3>
                                <p className="mt-1 text-base font-medium text-slate-900">
                                    Monthly downloads
                                </p>
                                <p className="mt-4 max-w-xl text-base/7 text-slate-600 md:text-sm/7">
                                    All components are available as an NPM package. Download it, and
                                    you'll always have the latest version.
                                </p>
                            </li>
                            <li aria-label="GitHub FireCMS UI Repository" className="relative">
                                <a
                                    href="https://github.com/tremorlabs/tremor"
                                    className="focus:outline-none"
                                    target="_blank"
                                    rel="noreferrer"
                                >
            <span
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
              >
                <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                />
              </svg>
            </span>
                                </a>
                                <h3 className="mt-4 w-fit text-clip bg-gradient-to-t from-slate-900 to-slate-700 bg-clip-text text-4xl font-bold text-transparent">
                                    15K+
                                </h3>
                                <p className="mt-1 text-base font-medium text-slate-900">
                                    Stargazers on GitHub
                                </p>
                                <p className="mt-4 max-w-xl text-base/7 text-slate-600 md:text-sm/7">
                                    Good ideas come from everywhere. Visit our GitHub to create issues,
                                    request features, or contribute.
                                </p>
                            </li>
                            <li aria-label="Figma FireCMS UI Repository" className="relative">
                                <a
                                    href="https://www.tremor.so/figma"
                                    className="focus:outline-none"
                                    target="_blank"
                                    rel="noreferrer"
                                >
            <span
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <svg
                  width={13}
                  height={20}
                  fill="none"
                  viewBox="0 0 13 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  aria-hidden="true"
              >
                <g clipPath="url(#prefix__clip0_8427_3)">
                  <path
                      d="M6.492 9.745a3.25 3.25 0 116.499 0 3.25 3.25 0 01-6.499 0z"
                      fill="#1ABCFE"
                  />
                  <path
                      d="M0 16.245a3.25 3.25 0 013.25-3.249h3.248v3.25a3.25 3.25 0 01-6.498 0z"
                      fill="#0ACF83"
                  />
                  <path
                      d="M6.5-.004v6.499h3.25a3.25 3.25 0 000-6.499H6.5z"
                      fill="#FF7262"
                  />
                  <path
                      d="M0 3.245a3.25 3.25 0 003.25 3.25h3.248V-.004H3.25A3.25 3.25 0 000 3.246z"
                      fill="#F24E1E"
                  />
                  <path
                      d="M0 9.745a3.25 3.25 0 003.25 3.25h3.248V6.496H3.25A3.25 3.25 0 000 9.746z"
                      fill="#A259FF"
                  />
                </g>
                <defs>
                  <clipPath id="prefix__clip0_8427_3">
                    <path fill="#fff" d="M0 0h13v20H0z"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
                                </a>
                                <h3 className="mt-4 w-fit text-clip bg-gradient-to-t from-slate-900 to-slate-700 bg-clip-text text-4xl font-bold text-transparent">
                                    4K+
                                </h3>
                                <p className="mt-1 text-base font-medium text-slate-900">
                                    Users on Figma
                                </p>
                                <p className="mt-4 max-w-xl text-base/7 text-slate-600 md:text-sm/7">
                                    Join our Figma community to access design resources, share feedback,
                                    and connect with other designers.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>

            </div>

        </Layout>
    );
}

export default UiPage;
