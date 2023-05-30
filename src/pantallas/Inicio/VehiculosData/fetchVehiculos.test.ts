import AxiosMock from 'axios-mock-adapter';

import { axiosApis } from '@/AxiosVue';
import {
  fetchVehiculos as fetchVehiculosBase,
  HomeGridHttpResponseBody,
} from './fetchVehiculos';
import vehiculosMock from './vehiculosMock';

describe('Obtención de vehículos', () => {
  const usuarioId = 789;
  const clienteId = 123;
  const homeGridUrl = 'Vehiculo/homeGrid';
  const networkMock = new AxiosMock(axiosApis.vehiculo.instance);
  const mockNextReply = ({
    status = 200,
    body,
    headers = {},
  }: {
    status?: number;
    body: HomeGridHttpResponseBody;
    headers?: unknown;
  }) => networkMock.onPost(homeGridUrl).replyOnce(status, body, headers);

  const fetchVehiculos = async () => {
    const findHttpRequest = (relativeUrl: string) => {
      const request = networkMock.history.post.find(
        // @ts-ignore: `metadata` existe en tipo `AxiosRequestConfig`
        ({ metadata: { url } }) => url === relativeUrl
      );
      return {
        ...request,
        data: JSON.parse(request.data),
      };
    };
    const vehiculos = await fetchVehiculosBase();
    return {
      request: findHttpRequest(homeGridUrl),
      response: vehiculos,
    };
  };

  beforeAll(async () => {
    localStorage.clienteDefecto = clienteId.toString();
  });

  test('Realiza solicitud http correcta a endpoint designado', async () => {
    mockNextReply({
      body: vehiculosMock,
    });
    const {
      request: { data: httpReqBody },
    } = await fetchVehiculos();
    expect(httpReqBody).toBeDefined();
    expect(httpReqBody.usuarioId).toBe(usuarioId);
    expect(httpReqBody.clienteId).toBe(clienteId);
  });

  test('Maneja casos de respuesta inválida de acuerdo al contrato', () => {
    const expectEmptyArray = async (body: any) => {
      mockNextReply({ body });
      const { response: vehiculos } = await fetchVehiculos();

      expect(vehiculos).toBeInstanceOf(Array);
      expect(vehiculos).toHaveLength(0);
    };

    return Promise.all([
      expectEmptyArray(null),
      expectEmptyArray(''),
      expectEmptyArray('string'),
      expectEmptyArray({}),
      expectEmptyArray({ data: null }),
      expectEmptyArray({ data: '' }),
      expectEmptyArray({ data: 'string' }),
      expectEmptyArray({ data: {} }),
    ]);
  });

  test('Solo filtra vehículos que se adhieren al esquema', async () => {
    const expectLengthToBe = async (body: any, expectedLength: number) => {
      mockNextReply({
        body,
      });
      const { response: vehiculos } = await fetchVehiculos();
      expect(vehiculos).toBeInstanceOf(Array);
      expect(vehiculos).toHaveLength(expectedLength);
    };

    const invalidMock = {
      data: [
        {
          ano: 2015,
        },
        {
          ano: null,
        },
        {
          ano: {},
        },
        {},
      ],
    };
    return Promise.all([
      expectLengthToBe(invalidMock, 0),
      expectLengthToBe(
        { ...invalidMock, data: [...invalidMock.data, { ano: '2015' }] },
        1
      ),
    ]);
  });
});
