import React, { memo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Spinner from './components/Spinner';
import Table from './components/Table';
// 페이지의 마운트 여부를 확인하기 위한 hok
import useMountedRef from './hooks/useMountedRef';
// Axios 기능 제공 hook
import useAxios from "axios-hooks";

/** 드롭다운을 배치하기 위한 박스 */
const SelectContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: #fff;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  margin: 0;

  select {
    margin-right: 15px;
    font-size: 16px;
    padding: 5px 10px;
  }
`;

// 접속할 백엔드의 URL
const URL = "/traffic_acc";

const App = memo(()  => {
  // 옵션 선택값 생성을 위한 배열
  const optionArr = ['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018'];  
  // 교통사고 건수, 사망자 수, 부상자 수 목록 Ajax로 가져오기
  const [{ data, loading, error }, refetch] = useAxios(URL);
  // 각 드롭다운의 선택 상태를 저장하기 위한 상태변수
  const [year, setYear] = useState({
    year: '',
  });

  // 이 컴포넌트가 화면에 마운드 되어있는지를 확인하기 위한 hook
  const mountedRef = useMountedRef();

  /** 드롭다운 선택 변경 시 호출되는 이벤트 */
  const onSelectChange = useCallback((e) => {
    e.preventDefault();

    // 드롭다운의 입력값 취득
    const current = e.target;
    const key = current.name;
    const value = current[current.selectedIndex].value;

    // 기존 상태값 복사 후 드롭다운의 name 속성과 일치하는 key에 대한 value를 수정
    const newYear = {...year, [key] : value};
    
    // 상태값 갱신
    setYear(newYear);

    // 갱신된 상태값 확인
    console.log(newYear);
    
    // 의존성 관리
  },[year]);

  /** year 상태값이 변경되었을 때 실행될 hook */
  useEffect(() => {
    // 컴포넌트가 화면에 마운트 된 이후에만 동작하도록 한다.
    if(mountedRef.current) {
      // 상태값 중에서 빈값이 아닌 항목들을 옮겨담는다.
      const params = {};
      for (const key in year) {
        if (year[key]) {
          params[key] = year[key];
        }
      }

      // Ajax 재요청
      refetch({
        params: params
      });
    }
    // 의존성 관리
  }, [mountedRef, refetch, year]);


  /** 에러 발생 메시지 설정 */
  if (error) {
    return (
      <div>
        <h1>에러발생 ::: {error.code} Error.</h1>
        <hr />
        <p>{error.message}</p>
      </div>
    )
  }

  /** 메인 화면 구성 */
  return (
    <div>
      {/* 로딩바 */}
      <Spinner loading={loading}></Spinner>
      <h1>Exam 10</h1>
      <hr />
      {/* 검색 조건 드롭다운 박스 */}
      <SelectContainer>
        <select name="year" onChange={onSelectChange}>
          <option value="">-- 년도 선택 --</option>
          {optionArr.map((v, i) => {
            return (
              <option value={v} key={i}>{v}년도</option>
            )
          })};
        </select>
      </SelectContainer>
      <Table>
        <thead>
          <tr>
            <th>번호</th>
            <th>년도</th>
            <th>월</th>
            <th>교통사고 건수</th>
            <th>사망자 수</th>
            <th>부상자 수</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map(({
            id, year, month, accident, death, injury
          }, i) => {
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{year}년</td>
                <td>{month}월</td>
                <td>{accident}건</td>
                <td>{death}명</td>
                <td>{injury}명</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan='3' align="center">합계</td>
            <td>{data&&data.reduce((acc, cur) => acc + cur.accident, 0)}건</td>
            <td>{data&&data.reduce((acc, cur) => acc + cur.death, 0)}명</td>
            <td>{data&&data.reduce((acc, cur) => acc + cur.injury, 0)}명</td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
});

export default App;
