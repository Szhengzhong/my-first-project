<template>
    <div v-if="display" class="spinner">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 141.7 141.7" width="48" height="48">
            <g class="outter">
                <path fill="#e03116" d="M70.9,20.7c16.3,0,31.6,8,40.9,21.3l6.4-4.7C99.9,11.2,63.7,4.9,37.5,23.4c-1.4,1-2.7,2-4,3.1l5.6,5.7 C48.1,24.7,59.3,20.7,70.9,20.7z" />
                <path fill="#e03116" d="M70.9,121c-27.7,0-50.1-22.4-50.1-50c0-12.2,4.4-23.9,12.4-33l-5.7-5.7c-21.4,23.9-19.3,60.6,4.6,82 s60.6,19.3,82-4.6c1.6-1.8,3.2-3.8,4.5-5.8c-1.8-1.3-4-2.9-6.5-4.7C102.9,112.8,87.5,121,70.9,121z" />
                <circle fill="none" cx="70.9" cy="70.9" r="58.2" />
            </g>
            <g class="middle">
                <path fill="#e03116" d="M34.4,71c0-20.2,16.4-36.6,36.6-36.6c12,0,23.2,5.9,30.1,15.7l6.4-4.7C93.4,25.1,65.7,20.1,45.4,34.2 S20.2,76.1,34.3,96.3c0.7,1,1.4,2,2.2,2.9l5.7-5.7C37.1,87.1,34.4,79.2,34.4,71z" />
                <path fill="#e03116" d="M71,107.6c-8.4,0-16.5-2.8-23-8.1l-5.6,5.7c18.8,15.8,47,13.4,62.8-5.5c1-1.2,1.9-2.4,2.8-3.7l-6.4-4.7 C94.7,101.5,83.2,107.6,71,107.6z" />
                <circle fill="none" cx="70.9" cy="70.8" r="44.7" />
            </g>
            <g class="inner">
                <path fill="#e03116" d="M70.9,94.2c-12.9,0-23.4-10.4-23.4-23.3c0-11,7.7-20.6,18.5-22.9v-8.1c-17.1,2.7-28.7,18.8-26,35.9 s18.8,28.7,35.9,26c8.7-1.4,16.4-6.4,21.2-13.7l-6.4-4.8C86.4,90.1,78.9,94.2,70.9,94.2z" />
                <path fill="#e03116" d="M90.2,57.8l6.4-4.7c-5.2-7.5-13.3-12.4-22.4-13.4v8.1C80.8,48.7,86.5,52.4,90.2,57.8z" />
                <circle fill="none" cx="70.9" cy="70.9" r="31.3" />
            </g>
        </svg>
    </div>
</template>

<script>
    export default {
        name: "spinner",

        data() {
            return {
                display: false,
            };
        },

        mounted() {
            setTimeout(() => {
                this.display = true;
            }, 500);
        },
    };
</script>

<style lang="scss" scoped>
    @keyframes loading {
        to {
            stroke-dashoffset: 1166 * 1.1;
        }
    }

    .spinner {
        display: inline-flex;
        flex-direction: column;
        align-content: center;
        align-items: center;
        user-select: none;

        .inner {
            transform-origin: 50% 50%;
            animation: 3.4s cubic-bezier(0.46, 0.23, 0.49, 1.02) infinite both inner;
        }

        @keyframes inner {
            0%{
                transform: rotateZ(0deg);
            }

            100% {
                transform: rotateZ(360deg);
            }
        }

        .outter {
            transform-origin: 50% 50%;
            animation: 3.4s cubic-bezier(0.61, 0, 0.64, 0.79) infinite both outter;
        }

        @keyframes outter {
            0% {
                transform: rotateZ(0deg);
            }

            100% {
                transform: rotateZ(360deg);
            }
        }

        .middle {
            transform-origin: 50% 50%;
            animation: 1.7s cubic-bezier(0.32, 0.02, 0.65, 0.99) infinite both middle;
            animation-direction: reverse;
        }

        @keyframes middle {
            0% {
                transform: rotateZ(0deg);
            }

            100% {
                transform: rotateZ(360deg);
            }
        }
    }
</style>
